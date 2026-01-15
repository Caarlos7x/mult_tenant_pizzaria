import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@pizzaria/db";
import { getTenantId } from "@/lib/get-tenant";
import { requireAdmin } from "@/lib/admin-auth";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1, "Nome da categoria é obrigatório"),
  description: z.string().optional(),
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

    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Verifica se a categoria já existe
    const existingCategory = await prisma.category.findFirst({
      where: {
        tenantId,
        name: validatedData.name,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: `A categoria "${validatedData.name}" já existe` },
        { status: 400 }
      );
    }

    // Busca o maior sortOrder para colocar a nova categoria no final
    const lastCategory = await prisma.category.findFirst({
      where: { tenantId },
      orderBy: { sortOrder: "desc" },
    });

    const newSortOrder = lastCategory ? lastCategory.sortOrder + 1 : 1;

    // Cria a categoria
    const category = await prisma.category.create({
      data: {
        tenantId,
        name: validatedData.name,
        description: validatedData.description || null,
        sortOrder: newSortOrder,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Categoria "${validatedData.name}" criada com sucesso!`,
      categoryId: category.id,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    
    console.error("Erro ao criar categoria:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

