import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { MobileMenu } from "@/components/mobile-menu";
import type { Tenant } from "@pizzaria/db";

interface HeaderProps {
  tenant: Tenant;
}

export async function Header({ tenant }: HeaderProps) {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-2 sm:px-4 py-3 sm:py-4 max-w-full overflow-x-hidden">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity group"
        >
          {tenant.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt={tenant.name}
              className="h-10 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="h-10 sm:h-14 w-10 sm:w-14 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
              <span className="text-white text-xl sm:text-2xl font-bold">🍕</span>
            </div>
          )}
          <h1 className="text-lg sm:text-2xl font-bold truncate text-gray-900">
            {tenant.name}
          </h1>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Menu desktop - visível apenas em telas maiores */}
          <Link href="/menu">
            <Button
              variant="ghost"
              className="hidden sm:inline-flex text-gray-700 hover:text-primary hover:bg-primary/10"
            >
              Cardápio
            </Button>
          </Link>
          {session ? (
            <>
              <Link href="/orders">
                <Button
                  variant="ghost"
                  className="hidden sm:inline-flex text-gray-700 hover:text-primary hover:bg-primary/10"
                >
                  Meus Pedidos
                </Button>
              </Link>
              <Link href="/account">
                <Button
                  variant="ghost"
                  className="hidden sm:inline-flex text-gray-700 hover:text-primary hover:bg-primary/10"
                >
                  Minha Conta
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login">
              <Button
                variant="ghost"
                className="hidden sm:inline-flex text-gray-700 hover:text-primary hover:bg-primary/10"
              >
                Entrar
              </Button>
            </Link>
          )}
          {/* Menu mobile - visível apenas em telas menores */}
          <MobileMenu />
          {/* Carrinho - visível em todas as telas */}
          <CartDrawer />
        </nav>
      </div>
    </header>
  );
}

