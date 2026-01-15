import { requireAdmin } from "@/lib/admin-auth";
import { getTenant } from "@/lib/get-tenant";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  const tenant = await getTenant();

  if (!tenant) {
    return <div>Tenant não encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-sm text-gray-600 mt-1">Painel Administrativo</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link href="/admin">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-700 hover:bg-primary/10 hover:text-primary"
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Button>
          </Link>

          <Link href="/admin/products">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-700 hover:bg-primary/10 hover:text-primary"
            >
              <Package className="h-5 w-5" />
              Produtos
            </Button>
          </Link>

          <Link href="/admin/orders">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-700 hover:bg-primary/10 hover:text-primary"
            >
              <ShoppingCart className="h-5 w-5" />
              Pedidos
            </Button>
          </Link>

          <Link href="/admin/settings">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-700 hover:bg-primary/10 hover:text-primary"
            >
              <Settings className="h-5 w-5" />
              Configurações
            </Button>
          </Link>

          <div className="pt-4 border-t border-gray-200 mt-4">
            <Link href="/">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
                Ver Loja
              </Button>
            </Link>
            <SignOutButton className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100 mt-2" />
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

