import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@pizzaria/db";
import { getTenantId } from "@/lib/get-tenant";
import { auth } from "@/lib/auth";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().nullable(),
  type: z.enum(["PIZZA", "DRINK", "COMBO", "DESSERT", "OTHER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "OUT_OF_STOCK"]),
  categoryId: z.string().optional().nullable(),
  basePrice: z.number().min(0),
  imageUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().default(0),
});

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validatedData = createProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        tenantId,
        ...validatedData,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Erro ao criar produto:", error);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}

