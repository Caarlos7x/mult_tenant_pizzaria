import { requireAdmin } from "@/lib/admin-auth";
import { getTenant, getTenantId } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import { formatDate } from "@/lib/utils";
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Users,
  TrendingUp
} from "lucide-react";

export default async function AdminDashboard() {
  await requireAdmin();
  const tenant = await getTenant();
  const tenantId = await getTenantId();

  if (!tenant || !tenantId) {
    return <div>Tenant não encontrado</div>;
  }

  // Estatisticas
  const [
    totalProducts,
    totalOrders,
    totalRevenue,
    totalCustomers,
    recentOrders,
  ] = await Promise.all([
    prisma.product.count({
      where: { tenantId },
    }),
    prisma.order.count({
      where: { tenantId },
    }),
    prisma.order.aggregate({
      where: {
        tenantId,
        status: "DELIVERED", // Considera apenas pedidos entregues como receita
      },
      _sum: {
        total: true,
      },
    }),
    prisma.user.count({
      where: {
        tenantId,
        role: "CUSTOMER",
      },
    }),
    prisma.order.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          take: 1,
        },
      },
    }),
  ]);

  const revenue = Number(totalRevenue._sum.total || 0);

  // Tradução dos status para português
  const statusLabels: Record<string, string> = {
    PENDING_PAYMENT: "Aguardando Pagamento",
    RECEIVED: "Recebido",
    CONFIRMED: "Confirmado",
    PREPARING: "Preparando",
    OUT_FOR_DELIVERY: "Saiu para Entrega",
    DELIVERED: "Entregue",
    CANCELED: "Cancelado",
  };

  const stats = [
    {
      name: "Total de Produtos",
      value: totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      name: "Total de Pedidos",
      value: totalOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      name: "Receita Total",
      value: `R$ ${revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      name: "Clientes",
      value: totalCustomers,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral do seu negócio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Pedidos Recentes
        </h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-600">Nenhum pedido ainda</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Pedido
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-sm">
                      #{order.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {order.customerName || order.customerEmail}
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold">
                      R$ {Number(order.total).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "DELIVERED"
                            ? "bg-green-100 text-green-800"
                            : order.status === "PREPARING"
                            ? "bg-orange-100 text-orange-800"
                            : order.status === "CANCELED"
                            ? "bg-red-100 text-red-800"
                            : order.status === "OUT_FOR_DELIVERY"
                            ? "bg-indigo-100 text-indigo-800"
                            : order.status === "CONFIRMED"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(order.createdAt).split(",")[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

