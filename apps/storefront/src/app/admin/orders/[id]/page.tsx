import { requireAdmin } from "@/lib/admin-auth";
import { getTenantId } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { OrderStatusUpdater } from "@/components/admin/order-status-updater";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await requireAdmin();
  const tenantId = await getTenantId();

  if (!tenantId) {
    return <div>Tenant não encontrado</div>;
  }

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      tenantId,
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

  const statusColors: Record<string, string> = {
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
    RECEIVED: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-purple-100 text-purple-800",
    PREPARING: "bg-orange-100 text-orange-800",
    OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
    DELIVERED: "bg-green-100 text-green-800",
    CANCELED: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: "Aguardando Pagamento",
    RECEIVED: "Recebido",
    CONFIRMED: "Confirmado",
    PREPARING: "Preparando",
    OUT_FOR_DELIVERY: "Saiu para Entrega",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <Link href="/admin/orders">
          <Button variant="ghost" className="mb-4 flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Pedidos
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Pedido #{order.orderNumber}
          </h1>
          <p className="text-gray-600">
            Realizado em {new Date(order.createdAt).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Itens do Pedido */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">Itens do Pedido</h2>
            </div>
            <div className="space-y-4">
              {order.items.map((item) => {
                const getDefaultImage = () => {
                  if (item.product.imageUrl) return item.product.imageUrl;
                  return "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop";
                };

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <img
                      src={getDefaultImage()}
                      alt={item.productName}
                      className="h-20 w-20 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                      {item.compositionType === "HALF_HALF" && (
                        <p className="text-sm text-gray-600">Pizza meio a meio</p>
                      )}
                      {item.variants.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {item.variants.map((v) => v.variantName).join(", ")}
                        </p>
                      )}
                      {item.modifiers.length > 0 && (
                        <p className="text-sm text-gray-600">
                          {item.modifiers.map((m) => m.option.name).join(", ")}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-700">
                        {item.quantity}x R$ {Number(item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg text-primary">
                        R$ {Number(item.totalPrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-gray-900">Endereço de Entrega</h2>
            </div>
            <div className="text-sm space-y-2 text-gray-700">
              {(() => {
                try {
                  const address = typeof order.deliveryAddress === "string" 
                    ? JSON.parse(order.deliveryAddress) 
                    : order.deliveryAddress;
                  
                  return (
                    <>
                      <p className="font-semibold text-gray-900">
                        {address.street}, {address.number}
                        {address.complement && ` - ${address.complement}`}
                      </p>
                      <p>{address.neighborhood}</p>
                      <p>
                        {address.city} - {address.state} {address.zipCode}
                      </p>
                      {address.reference && (
                        <p className="text-gray-600 mt-3 pt-3 border-t border-gray-200">
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

          {/* Informações do Cliente */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informações do Cliente</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nome:</span>{" "}
                <span className="text-gray-900">{order.customerName || "Não informado"}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>{" "}
                <span className="text-gray-900">{order.customerEmail}</span>
              </div>
              {order.customerPhone && (
                <div>
                  <span className="font-medium text-gray-700">Telefone:</span>{" "}
                  <span className="text-gray-900">{order.customerPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 space-y-6">
            {/* Status do Pedido */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Status do Pedido</h2>
              <OrderStatusTimeline
                currentStatus={order.status}
                statusHistory={order.statusHistory}
              />
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <OrderStatusUpdater
                  orderId={order.id}
                  currentStatus={order.status}
                />
              </div>
            </div>

            {/* Resumo */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Resumo</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Subtotal</span>
                  <span>R$ {Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-700">
                  <span>Taxa de entrega</span>
                  <span>R$ {Number(order.deliveryFee).toFixed(2)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-medium">
                    <span>Desconto</span>
                    <span>-R$ {Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary">R$ {Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pagamento */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-gray-900">Pagamento</h2>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Método</span>
                  <span className="font-medium text-gray-900">
                    {order.paymentMethod === "CASH_ON_DELIVERY" && "Pagar na Entrega"}
                    {order.paymentMethod === "ONLINE" && "Pagamento Online"}
                    {order.paymentMethod === "PIX" && "PIX"}
                    {order.paymentMethod === "CREDIT_CARD" && "Cartão de Crédito"}
                    {order.paymentMethod === "DEBIT_CARD" && "Cartão de Débito"}
                    {!["CASH_ON_DELIVERY", "ONLINE", "PIX", "CREDIT_CARD", "DEBIT_CARD"].includes(order.paymentMethod) && order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${
                    order.paymentStatus === "PAID" ? "text-green-600" :
                    order.paymentStatus === "FAILED" ? "text-red-600" :
                    order.paymentStatus === "REFUNDED" ? "text-orange-600" :
                    "text-yellow-600"
                  }`}>
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

