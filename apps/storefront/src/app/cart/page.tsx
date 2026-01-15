"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/components/cart/cart-item";
import { ShoppingCart } from "lucide-react";

export default function CartPage() {
  const { items, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">Seu carrinho está vazio</h1>
          <p className="mb-6 text-muted-foreground">Adicione itens ao carrinho para continuar</p>
          <Link href="/menu">
            <Button>Ver Cardápio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full overflow-x-hidden">
      <h1 className="mb-4 sm:mb-8 text-2xl sm:text-3xl font-bold">Carrinho</h1>

      <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold">Resumo do Pedido</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "itens"})</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Taxa de entrega</span>
                <span>Será calculada no checkout</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total estimado</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                Finalizar Pedido
              </Button>
            </Link>
            <Link href="/menu" className="block mt-2">
              <Button variant="outline" className="w-full">
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

