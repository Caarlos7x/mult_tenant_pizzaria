import { getTenant } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import { notFound } from "next/navigation";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const tenant = await getTenant();

  if (!tenant) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      tenantId: tenant.id,
    },
    include: {
      items: {
        include: {
          product: true,
          variants: {
            include: {
              variant: true,
            },
          },
          modifiers: {
            include: {
              option: true,
            },
          },
        },
      },
      statusHistory: {
        orderBy: {
          createdAt: "desc",
        },
      },
      deliveryZone: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full overflow-x-hidden">
      <div className="mb-4 sm:mb-8">
        <h1 className="mb-2 text-2xl sm:text-3xl font-bold">Pedido #{order.orderNumber}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Realizado em {new Date(order.createdAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="mb-4 text-xl font-semibold">Itens do Pedido</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0">
                  {item.product.imageUrl && (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="h-20 w-20 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.productName}</h3>
                    {item.compositionType === "HALF_HALF" && (
                      <p className="text-sm text-muted-foreground">Pizza meio a meio</p>
                    )}
                    {item.variants.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {item.variants.map((v) => v.variant.name).join(", ")}
                      </p>
                    )}
                    <p className="mt-1 text-sm">
                      {item.quantity}x R$ {Number(item.unitPrice).toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R$ {Number(item.totalPrice).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold">Endereço de Entrega</h2>
            <div className="text-sm space-y-1">
              {(() => {
                try {
                  const address = typeof order.deliveryAddress === "string" 
                    ? JSON.parse(order.deliveryAddress) 
                    : order.deliveryAddress;
                  
                  return (
                    <>
                      <p className="font-medium">
                        {address.street}, {address.number}
                        {address.complement && ` - ${address.complement}`}
                      </p>
                      <p>{address.neighborhood}</p>
                      <p>
                        {address.city} - {address.state} {address.zipCode}
                      </p>
                      {address.reference && (
                        <p className="text-muted-foreground mt-2">
                          <span className="font-medium">Referência:</span> {address.reference}
                        </p>
                      )}
                    </>
                  );
                } catch {
                  return <p>{String(order.deliveryAddress)}</p>;
                }
              })()}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 space-y-4 sm:space-y-6">
            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="mb-4 text-xl font-semibold">Status do Pedido</h2>
              <OrderStatusTimeline
                currentStatus={order.status}
                statusHistory={order.statusHistory}
              />
            </div>

            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold">Resumo</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Subtotal</span>
                  <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span>Taxa de entrega</span>
                  <span>R$ {Number(order.deliveryFee).toFixed(2)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm text-green-600">
                    <span>Desconto</span>
                    <span>-R$ {Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between text-sm sm:text-base font-semibold">
                    <span>Total</span>
                    <span>R$ {Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4 sm:p-6">
              <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold">Pagamento</h2>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span>Método</span>
                  <span>
                    {order.paymentMethod === "CASH_ON_DELIVERY" && "Pagar na Entrega"}
                    {order.paymentMethod === "ONLINE" && "Pagamento Online"}
                    {order.paymentMethod === "PIX" && "PIX"}
                    {order.paymentMethod === "CREDIT_CARD" && "Cartão de Crédito"}
                    {order.paymentMethod === "DEBIT_CARD" && "Cartão de Débito"}
                    {!["CASH_ON_DELIVERY", "ONLINE", "PIX", "CREDIT_CARD", "DEBIT_CARD"].includes(order.paymentMethod) && order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span>
                    {order.paymentStatus === "PENDING" && "Pendente"}
                    {order.paymentStatus === "PAID" && "Pago"}
                    {order.paymentStatus === "FAILED" && "Falhou"}
                    {order.paymentStatus === "REFUNDED" && "Reembolsado"}
                    {!["PENDING", "PAID", "FAILED", "REFUNDED"].includes(order.paymentStatus) && order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

