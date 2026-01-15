import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@pizzaria/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getTenantId } from "@/lib/get-tenant";

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Verifica se usuário já existe
    const existingUser = await prisma.user.findFirst({
      where: {
        tenantId,
        OR: [
          { email: validatedData.email },
          ...(validatedData.phone ? [{ phone: validatedData.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email ou telefone já cadastrado" },
        { status: 400 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Cria usuário
    const user = await prisma.user.create({
      data: {
        tenantId,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar registro" },
      { status: 500 }
    );
  }
}

