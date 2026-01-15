import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@pizzaria/db";
import { getTenantId } from "@/lib/get-tenant";
import { requireAdmin } from "@/lib/admin-auth";

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

    // Busca a categoria "Bebidas"
    const categoriaBebidas = await prisma.category.findFirst({
      where: {
        tenantId,
        name: "Bebidas",
        isActive: true,
      },
    });

    if (!categoriaBebidas) {
      return NextResponse.json(
        { error: "Categoria 'Bebidas' não encontrada" },
        { status: 404 }
      );
    }

    // Busca ou cria a categoria "Bebidas Alcóolicas"
    let categoriaAlcoolicas = await prisma.category.findFirst({
      where: {
        tenantId,
        name: "Bebidas Alcóolicas",
      },
    });

    if (!categoriaAlcoolicas) {
      categoriaAlcoolicas = await prisma.category.create({
        data: {
          tenantId,
          name: "Bebidas Alcóolicas",
          description: "Cervejas e outras bebidas alcóolicas",
          sortOrder: categoriaBebidas.sortOrder + 1,
          isActive: true,
        },
      });
    }
      update: {},
      create: {
        tenantId,
        name: "Bebidas Alcóolicas",
        description: "Cervejas e outras bebidas alcóolicas",
        sortOrder: categoriaBebidas.sortOrder + 1,
        isActive: true,
      },
    });

    // Busca todos os produtos de cerveja na categoria "Bebidas"
    const produtosCerveja = await prisma.product.findMany({
      where: {
        tenantId,
        categoryId: categoriaBebidas.id,
        name: {
          contains: "Cerveja",
          mode: "insensitive",
        },
      },
    });

    // Move os produtos para a nova categoria
    let movedCount = 0;
    if (produtosCerveja.length > 0) {
      await prisma.product.updateMany({
        where: {
          id: {
            in: produtosCerveja.map((p) => p.id),
          },
        },
        data: {
          categoryId: categoriaAlcoolicas.id,
        },
      });
      movedCount = produtosCerveja.length;
    }

    return NextResponse.json({
      success: true,
      message: `Categoria 'Bebidas Alcóolicas' criada e ${movedCount} cerveja(s) movida(s)`,
      categoryId: categoriaAlcoolicas.id,
      movedCount,
      products: produtosCerveja.map((p) => p.name),
    });
  } catch (error: any) {
    console.error("Erro ao criar categoria de bebidas alcóolicas:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

