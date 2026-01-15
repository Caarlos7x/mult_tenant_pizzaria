import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTenant } from "@/lib/get-tenant";
import { prisma } from "@pizzaria/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
import { AddressForm } from "@/components/address/address-form";
import { AddressList } from "@/components/address/address-list";

export default async function AccountPage() {
  const session = await auth();
  const tenant = await getTenant();

  // Validações robustas
  if (!session) {
    redirect("/login");
  }

  if (!tenant) {
    redirect("/login");
  }

  const userId = (session.user as any)?.id || session.user?.id;
  
  if (!userId) {
    redirect("/login");
  }

  // Busca dados completos do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
        },
      },
      addresses: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl overflow-x-hidden">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            ← Voltar para o cardápio
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Minha Conta</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Pessoais */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Informações Pessoais</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="font-medium">{user.name || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Benefícios de Fidelidade */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Programa de Fidelidade</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Pedidos Realizados</p>
              <p className="text-2xl font-bold text-primary">
                {user.orders.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium">
                {user.orders.length >= 10
                  ? "⭐ Cliente VIP"
                  : user.orders.length >= 5
                  ? "⭐ Cliente Fiel"
                  : "Cliente"}
              </p>
            </div>
            {user.orders.length >= 10 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm text-yellow-800">
                  🎉 Parabéns! Você é um cliente VIP e tem direito a descontos
                  especiais!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pedidos Recentes */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Pedidos Recentes</h2>
          <Link href="/orders">
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </Link>
        </div>
        {user.orders.length > 0 ? (
          <div className="space-y-3">
            {user.orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pedido #{order.orderNumber}</p>
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
                  <div className="text-right">
                    <p className="font-bold">
                      R$ {Number(order.total).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">{order.status}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Nenhum pedido ainda.</p>
        )}
      </div>

      {/* Endereços Salvos */}
      <AddressList addresses={user.addresses} />

      {/* Botão de Sair */}
      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  );
}

