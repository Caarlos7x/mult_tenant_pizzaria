import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenant } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  RECEIVED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-orange-100 text-orange-800",
  READY: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  PENDING_PAYMENT: "Aguardando Pagamento",
  RECEIVED: "Recebido",
  PREPARING: "Preparando",
  READY: "Pronto",
  OUT_FOR_DELIVERY: "Saiu para Entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export default async function OrdersPage() {
  const session = await auth();
  const tenant = await getTenant();

  if (!session || !tenant || !session.user || !session.user.email) {
    redirect("/login");
  }

  const orders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      customerEmail: session.user.email,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
    },
  });

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl overflow-x-hidden">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            ← Voltar para o cardápio
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Meus Pedidos</h1>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">Você ainda não fez nenhum pedido.</p>
          <Link href="/menu">
            <Button>Ver Cardápio</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold">
                      Pedido #{order.orderNumber}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl font-bold text-primary">
                    R$ {Number(order.total).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">Ver detalhes →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

