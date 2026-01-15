import { NextRequest, NextResponse } from "next/server";
import { checkoutSchema } from "@pizzaria/validators";
import { prisma, OrderStatus, PaymentMethod, PaymentStatus } from "@pizzaria/db";
import { getTenantId } from "@/lib/get-tenant";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const session = await auth();

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 400 });
    }

    const body = await request.json();
    const { items, ...checkoutData } = body;

    // Valida dados do checkout
    const validatedCheckout = checkoutSchema.parse(checkoutData);

    // Busca tenant para obter próximo número de pedido
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 404 });
    }

    // Gera número do pedido (sequencial por tenant)
    const lastOrder = await prisma.order.findFirst({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });

    const orderNumber = lastOrder
      ? String(Number(lastOrder.orderNumber) + 1).padStart(6, "0")
      : "000001";

    // Calcula valores
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: {
          id: item.productId,
          tenantId,
        },
        include: {
          variants: true,
        },
      });

      if (!product) continue;

      let itemPrice = Number(product.basePrice);

      // Adiciona variantes
      if (item.variantIds?.length > 0) {
        const variants = await prisma.productVariant.findMany({
          where: {
            id: { in: item.variantIds },
            productId: product.id,
          },
        });
        itemPrice += variants.reduce((sum, v) => sum + Number(v.price), 0);
      }

      // Adiciona modificadores
      if (item.modifierOptionIds?.length > 0) {
        const options = await prisma.modifierOption.findMany({
          where: {
            id: { in: item.modifierOptionIds },
          },
        });
        itemPrice += options.reduce((sum, o) => sum + Number(o.price), 0);
      }

      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: itemPrice,
        totalPrice: itemTotal,
        compositionType: item.composition?.type || "FULL",
        composition: item.composition || null,
        notes: item.notes,
        variants: item.variantIds || [],
        modifiers: item.modifierOptionIds || [],
      });
    }

    // Calcula taxa de entrega (simplificado - pode melhorar com zonas)
    const deliveryFee = 5.0; // TODO: calcular baseado em deliveryZone

    // Aplica promoção se houver
    let discount = 0;
    if (validatedCheckout.promotionCode) {
      const promotion = await prisma.promotion.findFirst({
        where: {
          tenantId,
          code: validatedCheckout.promotionCode,
          isActive: true,
        },
      });

      if (promotion) {
        // Validações básicas
        const now = new Date();
        if (
          (!promotion.startsAt || promotion.startsAt <= now) &&
          (!promotion.endsAt || promotion.endsAt >= now) &&
          (!promotion.maxUses || promotion.usedCount < promotion.maxUses) &&
          (!promotion.minOrder || subtotal >= Number(promotion.minOrder))
        ) {
          if (promotion.type === "PERCENTAGE") {
            discount = subtotal * (Number(promotion.value) / 100);
          } else if (promotion.type === "FIXED") {
            discount = Number(promotion.value);
          } else if (promotion.type === "FREE_DELIVERY") {
            discount = deliveryFee;
          }

          // Atualiza contador de uso
          await prisma.promotion.update({
            where: { id: promotion.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const total = subtotal + deliveryFee - discount;

    // Determina status inicial baseado no método de pagamento
    const initialStatus =
      validatedCheckout.paymentMethod === "CASH_ON_DELIVERY"
        ? OrderStatus.RECEIVED
        : OrderStatus.PENDING_PAYMENT;

    const paymentStatus =
      validatedCheckout.paymentMethod === "CASH_ON_DELIVERY"
        ? PaymentStatus.PENDING
        : PaymentStatus.PENDING;

    // Cria endereço se necessário
    let addressId: string | undefined;
    const address = await prisma.address.create({
      data: {
        street: validatedCheckout.address.street,
        number: validatedCheckout.address.number,
        complement: validatedCheckout.address.complement,
        neighborhood: validatedCheckout.address.neighborhood,
        city: validatedCheckout.address.city,
        state: validatedCheckout.address.state,
        zipCode: validatedCheckout.address.zipCode,
        reference: validatedCheckout.address.reference,
      },
    });
    addressId = address.id;

    // Cria pedido
    const order = await prisma.order.create({
      data: {
        tenantId,
        orderNumber,
        customerId: (session?.user as any)?.id || null, // Vincula ao usuário logado se houver
        customerName: validatedCheckout.customerName,
        customerPhone: validatedCheckout.customerPhone,
        customerEmail: validatedCheckout.customerEmail,
        status: initialStatus,
        addressId,
        deliveryAddress: JSON.stringify(validatedCheckout.address),
        subtotal,
        deliveryFee,
        discount,
        total,
        paymentMethod: validatedCheckout.paymentMethod as PaymentMethod,
        paymentStatus,
        notes: validatedCheckout.notes,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            compositionType: item.compositionType,
            composition: item.composition,
            notes: item.notes,
            variants: {
              create: item.variants.map((variantId) => ({
                variantId,
                variantName: "", // Será preenchido via join
                price: 0, // Será calculado
              })),
            },
            modifiers: {
              create: item.modifiers.map((optionId) => ({
                optionId,
                optionName: "", // Será preenchido via join
                price: 0, // Será calculado
              })),
            },
          })),
        },
        statusHistory: {
          create: {
            status: initialStatus,
          },
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao processar pedido" },
      { status: 500 }
    );
  }
}

