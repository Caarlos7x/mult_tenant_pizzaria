import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@pizzaria/db";
import { getTenantId } from "@/lib/get-tenant";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional().nullable(),
  type: z.enum(["PIZZA", "DRINK", "COMBO", "DESSERT", "OTHER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).optional(),
  categoryId: z.string().optional().nullable(),
  basePrice: z.number().min(0).optional(),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 400 }
      );
    }

    // Verifica se o produto existe e pertence ao tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateProductSchema.parse(body);

    const product = await prisma.product.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar produto:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 400 }
      );
    }

    // Verifica se o produto existe e pertence ao tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    return NextResponse.json(
      { error: "Erro ao deletar produto" },
      { status: 500 }
    );
  }
}

