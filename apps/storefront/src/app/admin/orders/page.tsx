import { requireAdmin } from "@/lib/admin-auth";
import { getTenantId } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

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

export default async function AdminOrdersPage() {
  await requireAdmin();
  const tenantId = await getTenantId();

  if (!tenantId) {
    return <div>Tenant não encontrado</div>;
  }

  const orders = await prisma.order.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
        <p className="text-gray-600 mt-2">
          Gerencie todos os pedidos da sua pizzaria
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
          <p className="text-gray-600">Nenhum pedido ainda</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                  Pedido
                </th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                  Cliente
                </th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                  Total
                </th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                  Pagamento
                </th>
                <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">
                  Data
                </th>
                <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">
                      #{order.orderNumber}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.customerName || "Cliente"}
                      </p>
                      <p className="text-gray-600">{order.customerEmail}</p>
                      {order.customerPhone && (
                        <p className="text-gray-600">{order.customerPhone}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">
                      R$ {Number(order.total).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusColors[order.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.paymentStatus === "PAID"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "FAILED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.paymentStatus === "PAID"
                        ? "Pago"
                        : order.paymentStatus === "FAILED"
                        ? "Falhou"
                        : "Pendente"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

