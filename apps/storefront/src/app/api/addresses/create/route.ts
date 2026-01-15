import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@pizzaria/db";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getTenantId } from "@/lib/get-tenant";

const addressSchema = z.object({
  street: z.string().min(3, "Rua deve ter pelo menos 3 caracteres"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  reference: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const tenantId = await getTenantId();

    if (!session?.user || !tenantId) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const userId = (session.user as any)?.id || session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    // Verifica se o usuário pertence ao tenant
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Cria o endereço
    const address = await prisma.address.create({
      data: {
        street: validatedData.street,
        number: validatedData.number,
        complement: validatedData.complement,
        neighborhood: validatedData.neighborhood,
        city: validatedData.city,
        state: validatedData.state,
        zipCode: validatedData.zipCode.replace(/\D/g, ""),
        reference: validatedData.reference,
        userId: userId,
      },
      select: {
        id: true,
        street: true,
        number: true,
        complement: true,
        neighborhood: true,
        city: true,
        state: true,
        zipCode: true,
        reference: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao criar endereço:", error);
    return NextResponse.json(
      { error: "Erro ao processar endereço" },
      { status: 500 }
    );
  }
}

