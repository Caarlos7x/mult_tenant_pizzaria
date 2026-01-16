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
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Verifica se o produto existe e pertence ao tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
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
      where: { id },
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
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;

    // Verifica se o produto existe e pertence ao tenant
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se o produto está sendo usado em pedidos
    const orderItemsCount = await prisma.orderItem.count({
      where: {
        productId: id,
      },
    });

    // Deleta todos os OrderItems associados ao produto primeiro (exclusão em cascata)
    if (orderItemsCount > 0) {
      // Deleta os OrderItemVariants primeiro (se houver)
      const orderItems = await prisma.orderItem.findMany({
        where: { productId: id },
        select: { id: true },
      });

      const orderItemIds = orderItems.map((item) => item.id);

      if (orderItemIds.length > 0) {
        // Deleta OrderItemVariants
        await prisma.orderItemVariant.deleteMany({
          where: {
            orderItemId: {
              in: orderItemIds,
            },
          },
        });

        // Deleta OrderItemModifiers
        await prisma.orderItemModifier.deleteMany({
          where: {
            orderItemId: {
              in: orderItemIds,
            },
          },
        });

        // Deleta os OrderItems
        await prisma.orderItem.deleteMany({
          where: {
            productId: id,
          },
        });
      }
    }

    // Agora pode deletar o produto normalmente
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: orderItemsCount > 0
        ? `Produto deletado com sucesso. ${orderItemsCount} item(ns) de pedido(s) também foram removido(s).`
        : "Produto deletado com sucesso",
      action: "deleted",
      deletedOrderItems: orderItemsCount,
    });
  } catch (error: any) {
    console.error("Erro ao deletar produto:", error);
    
    // Trata erros de foreign key constraint de forma mais amigável
    if (error.code === "P2003" || error.message?.includes("Foreign key constraint")) {
      return NextResponse.json(
        {
          error: "Erro ao deletar produto. Verifique se há dependências que precisam ser removidas primeiro.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Erro ao deletar produto" },
      { status: 500 }
    );
  }
}

