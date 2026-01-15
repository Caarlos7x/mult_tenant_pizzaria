import { NextRequest, NextResponse } from "next/server";
import { prisma, OrderStatus } from "@pizzaria/db";
import { getTenantId } from "@/lib/get-tenant";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum([
    "PENDING_PAYMENT",
    "RECEIVED",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELED",
  ]),
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
    if (userRole !== "ADMIN" && userRole !== "ATTENDANT") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const tenantId = await getTenantId();
    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 400 }
      );
    }

    // Verifica se o pedido existe e pertence ao tenant
    const existingOrder = await prisma.order.findFirst({
      where: {
        id: params.id,
        tenantId,
      },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Validações de transição de status
    const validTransitions: Record<string, string[]> = {
      PENDING_PAYMENT: ["RECEIVED", "CANCELED"],
      RECEIVED: ["CONFIRMED", "CANCELED"],
      CONFIRMED: ["PREPARING", "CANCELED"],
      PREPARING: ["OUT_FOR_DELIVERY", "CANCELED"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
      DELIVERED: [], // Status final
      CANCELED: [], // Status final
    };

    const allowedStatuses = validTransitions[existingOrder.status] || [];
    if (
      validatedData.status !== existingOrder.status &&
      !allowedStatuses.includes(validatedData.status)
    ) {
      return NextResponse.json(
        {
          error: `Não é possível alterar de "${existingOrder.status}" para "${validatedData.status}"`,
        },
        { status: 400 }
      );
    }

    // Atualiza o pedido
    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: validatedData.status as OrderStatus,
      },
    });

    // Cria registro no histórico de status (apenas se mudou)
    if (validatedData.status !== existingOrder.status) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: params.id,
          status: validatedData.status as OrderStatus,
          notes: `Status alterado por ${(session.user as any)?.name || "Administrador"}`,
        },
      });
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar status do pedido:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar status do pedido" },
      { status: 500 }
    );
  }
}

