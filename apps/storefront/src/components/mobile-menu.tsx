"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ShoppingBag, User, LogIn, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSignOut = () => {
    setIsOpen(false);
    signOut({ redirectTo: "/" });
  };

  const menuContent = isOpen && (
    <>
      {/* Overlay escuro */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] sm:hidden"
        onClick={() => setIsOpen(false)}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      />

      {/* Menu drawer lateral */}
      <div 
        className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-[70] flex flex-col sm:hidden"
        style={{ top: 0, right: 0, height: "100vh" }}
      >
        {/* Header do menu */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Conteúdo do menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <Link href="/menu" onClick={() => setIsOpen(false)}>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-gray-700 hover:bg-primary/10 hover:text-primary h-auto py-3"
            >
              <Package className="h-5 w-5" />
              Cardápio
            </Button>
          </Link>

          {session ? (
            <>
              <Link href="/orders" onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-700 hover:bg-primary/10 hover:text-primary h-auto py-3"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Meus Pedidos
                </Button>
              </Link>
              <Link href="/account" onClick={() => setIsOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-700 hover:bg-primary/10 hover:text-primary h-auto py-3"
                >
                  <User className="h-5 w-5" />
                  Minha Conta
                </Button>
              </Link>
              <div className="pt-4 border-t border-gray-200 mt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-gray-700 hover:bg-red-50 hover:text-red-600 h-auto py-3"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5" />
                  Sair da Conta
                </Button>
              </div>
            </>
          ) : (
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-gray-700 hover:bg-primary/10 hover:text-primary h-auto py-3"
              >
                <LogIn className="h-5 w-5" />
                Entrar
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </>
  );

  return (
    <>
      {/* Botão do menu hambúrguer - visível apenas no mobile */}
      <Button
        variant="outline"
        size="icon"
        className="sm:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Renderiza o menu usando portal para garantir que fique acima de tudo */}
      {mounted && createPortal(menuContent, document.body)}
    </>
  );
}

