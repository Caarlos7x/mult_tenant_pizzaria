"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Carrinho vazio. Adicione itens antes de finalizar o pedido.</p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Voltar ao cardápio
        </Button>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          items,
        }),
      });

      const result = await response.json();

      if (result.success) {
        clear();
        router.push(`/orders/${result.order.id}`);
      } else {
        alert("Erro ao criar pedido: " + result.error);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao processar pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-full overflow-x-hidden">
      <h1 className="mb-4 sm:mb-8 text-2xl sm:text-3xl font-bold">Finalizar Pedido</h1>

      <div className="grid gap-4 sm:gap-8 lg:grid-cols-2">
        <div>
          <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold">Resumo do Pedido</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

