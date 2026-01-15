import { NextRequest, NextResponse } from "next/server";
import { prisma, ProductType, ProductStatus } from "@pizzaria/db";
import { getTenantId } from "@/lib/get-tenant";
import { requireAdmin } from "@/lib/admin-auth";
import * as XLSX from "xlsx";
import { z } from "zod";

// Schema de validação para cada linha da planilha
const productRowSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional().nullable().or(z.literal("")),
  type: z.enum(["PIZZA", "DRINK", "COMBO", "DESSERT", "OTHER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).default("ACTIVE"),
  basePrice: z.coerce.number().min(0, "Preço deve ser positivo"),
  categoryName: z.string().optional().nullable().or(z.literal("")), // Nome da categoria (será convertido para ID)
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  sortOrder: z.coerce.number().min(0).default(0),
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const tenantId = await getTenantId();

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não fornecido" },
        { status: 400 }
      );
    }

    // Lê o arquivo Excel
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Planilha vazia ou inválida" },
        { status: 400 }
      );
    }

    // Busca todas as categorias do tenant para mapear nomes para IDs
    const categories = await prisma.category.findMany({
      where: { tenantId, isActive: true },
    });
    const categoryMap = new Map(
      categories.map((cat) => [cat.name.toLowerCase().trim(), cat.id])
    );

    const errors: string[] = [];
    let imported = 0;

    // Processa cada linha da planilha
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as Record<string, any>;
      const rowNumber = i + 2; // +2 porque linha 1 é cabeçalho e índice começa em 0

      try {
        // Normaliza os nomes das colunas (remove espaços, converte para minúsculas)
        const normalizedRow: Record<string, any> = {};
        for (const [key, value] of Object.entries(row)) {
          const normalizedKey = key
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "")
            .replace(/[^a-z0-9]/g, "");
          normalizedRow[normalizedKey] = value;
        }

        // Mapeia os nomes das colunas para os campos do schema (case-insensitive)
        // Tenta várias variações de nomes de colunas
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
            if (normalizedRow[normalizedKey] !== undefined && normalizedRow[normalizedKey] !== null && normalizedRow[normalizedKey] !== "") {
              return normalizedRow[normalizedKey];
            }
          }
          return null;
        };

        const nameValue = getValue(["name", "nome", "productname", "product_name"]);
        if (!nameValue || String(nameValue).trim() === "") {
          errors.push(`Linha ${rowNumber}: Nome do produto é obrigatório`);
          continue;
        }

        const typeValue = getValue(["type", "tipo", "producttype", "product_type"]);
        const typeUpper = typeValue ? String(typeValue).toUpperCase().trim() : "OTHER";
        if (!["PIZZA", "DRINK", "COMBO", "DESSERT", "OTHER"].includes(typeUpper)) {
          errors.push(`Linha ${rowNumber}: Tipo inválido. Use: PIZZA, DRINK, COMBO, DESSERT ou OTHER`);
          continue;
        }

        const priceValue = getValue(["baseprice", "preco", "price", "preço", "base_price", "valor"]);
        const price = priceValue ? parseFloat(String(priceValue).replace(",", ".")) : 0;
        if (isNaN(price) || price < 0) {
          errors.push(`Linha ${rowNumber}: Preço inválido`);
          continue;
        }

        const mappedRow = {
          name: String(nameValue).trim(),
          description: getValue(["description", "descricao", "desc"]) || "",
          type: typeUpper,
          status: (getValue(["status", "estado", "productstatus", "product_status"]) as string)?.toUpperCase() || "ACTIVE",
          basePrice: price,
          categoryName: getValue(["categoryname", "categoria", "category", "category_name", "cat"]) || null,
          imageUrl: getValue(["imageurl", "imagem", "image", "image_url", "url"]) || "",
          sortOrder: getValue(["sortorder", "ordem", "order", "sort_order", "posicao"]) || 0,
        };

        // Valida os dados
        const validatedData = productRowSchema.parse(mappedRow);

        // Busca ou cria a categoria se fornecida
        let categoryId: string | null = null;
        if (validatedData.categoryName) {
          const categoryNameLower = validatedData.categoryName.toLowerCase().trim();
          const existingCategoryId = categoryMap.get(categoryNameLower);
          
          if (existingCategoryId) {
            categoryId = existingCategoryId;
          } else {
            // Cria a categoria se não existir
            const newCategory = await prisma.category.create({
              data: {
                tenantId,
                name: validatedData.categoryName.trim(),
                isActive: true,
              },
            });
            categoryId = newCategory.id;
            categoryMap.set(categoryNameLower, newCategory.id);
          }
        }

        // Cria o produto
        await prisma.product.create({
          data: {
            tenantId,
            name: validatedData.name.trim(),
            description: validatedData.description?.trim() || null,
            type: validatedData.type as ProductType,
            status: validatedData.status as ProductStatus,
            basePrice: validatedData.basePrice,
            categoryId,
            imageUrl: validatedData.imageUrl?.trim() || null,
            sortOrder: validatedData.sortOrder,
          },
        });

        imported++;
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          errors.push(
            `Linha ${rowNumber}: ${error.errors.map((e) => e.message).join(", ")}`
          );
        } else {
          errors.push(`Linha ${rowNumber}: ${error.message || "Erro desconhecido"}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      errors,
      total: data.length,
    });
  } catch (error: any) {
    console.error("Erro ao importar produtos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar arquivo" },
      { status: 500 }
    );
  }
}

