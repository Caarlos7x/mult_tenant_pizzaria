import { NextRequest, NextResponse } from "next/server";
import { cartItemSchema } from "@pizzaria/validators";
import { prisma } from "@pizzaria/db";
import { getTenantId } from "@/lib/get-tenant";

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 400 });
    }

    const body = await request.json();
    const item = cartItemSchema.parse(body);

    // Valida se o produto existe e pertence ao tenant
    const product = await prisma.product.findFirst({
      where: {
        id: item.productId,
        tenantId,
        status: "ACTIVE",
      },
      include: {
        variants: true,
        modifiers: {
          include: {
            modifier: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }

    // Calcula preço base
    let price = Number(product.basePrice);

    // Adiciona preço das variantes
    if (item.variantIds && item.variantIds.length > 0) {
      const variants = await prisma.productVariant.findMany({
        where: {
          id: { in: item.variantIds },
          productId: product.id,
        },
      });
      price += variants.reduce((sum, v) => sum + Number(v.price), 0);
    }

    // Adiciona preço dos modificadores
    if (item.modifierOptionIds && item.modifierOptionIds.length > 0) {
      const options = await prisma.modifierOption.findMany({
        where: {
          id: { in: item.modifierOptionIds },
        },
      });
      price += options.reduce((sum, o) => sum + Number(o.price), 0);
    }

    return NextResponse.json({
      success: true,
      item: {
        ...item,
        name: product.name,
        price,
        imageUrl: product.imageUrl || undefined,
      },
    });
  } catch (error) {
    console.error("Erro ao adicionar item ao carrinho:", error);
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 500 }
    );
  }
}

