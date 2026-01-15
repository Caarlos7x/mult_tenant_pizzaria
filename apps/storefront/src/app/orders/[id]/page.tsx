import { getTenant } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { OrderStatusTimeline } from "@/components/orders/order-status-timeline";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";

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
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header tenant={tenant} />

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-7xl flex-1">
        {/* Breadcrumb e título */}
        <div className="mb-6 sm:mb-8">
          <Link href="/orders">
            <Button variant="ghost" className="mb-4 flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar para Meus Pedidos
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
                  // Imagem padrão baseada no tipo de produto
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
                            {item.variants.map((v) => v.variant.name).join(", ")}
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
      </main>

      <Footer />
    </div>
  );
}

