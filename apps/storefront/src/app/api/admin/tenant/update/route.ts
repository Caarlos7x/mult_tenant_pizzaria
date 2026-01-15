import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@pizzaria/db";
import { getTenantId } from "@/lib/get-tenant";
import { auth } from "@/lib/auth";
import { z } from "zod";

const updateTenantSchema = z.object({
  name: z.string().min(2),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable(),
  logoUrl: z.string().url().nullable(),
  coverUrl: z.string().url().nullable(),
  phone: z.string().optional(),
  currency: z.string().min(1),
  timezone: z.string().min(1),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 }
      );
    }

    const tenantId = await getTenantId();

    if (!tenantId) {
      return NextResponse.json(
        { error: "Tenant não encontrado" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateTenantSchema.parse(body);

    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        name: validatedData.name,
        primaryColor: validatedData.primaryColor,
        secondaryColor: validatedData.secondaryColor,
        logoUrl: validatedData.logoUrl,
        coverUrl: validatedData.coverUrl,
        currency: validatedData.currency,
        timezone: validatedData.timezone,
        // phone não existe no schema ainda, precisaria adicionar
      },
    });

    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao atualizar tenant:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}

