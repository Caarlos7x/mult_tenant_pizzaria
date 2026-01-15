"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { CartItem } from "./cart-item";
import Link from "next/link";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, total, itemCount } = useCart();

  // Abre o carrinho quando um item é adicionado
  useEffect(() => {
    const handleItemAdded = () => {
      setIsOpen(true);
    };

    window.addEventListener("cart:item-added", handleItemAdded);
    return () => {
      window.removeEventListener("cart:item-added", handleItemAdded);
    };
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(true)}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {itemCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-background shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Carrinho</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Seu carrinho está vazio</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t p-4 space-y-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <Link href="/checkout" className="block">
                  <Button className="w-full" onClick={() => setIsOpen(false)}>
                    Finalizar Pedido
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

