"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import type { CartItem as CartItemType } from "@pizzaria/validators";

interface CartItemProps {
  item: CartItemType & { id: string; name: string; price: number; imageUrl?: string };
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex gap-2 sm:gap-4 rounded-lg border p-3 sm:p-4">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-16 sm:h-20 w-16 sm:w-20 rounded object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base truncate">{item.name}</h3>
        {item.composition?.type === "HALF_HALF" && (
          <p className="text-xs sm:text-sm text-muted-foreground">
            Meio: {item.composition.left?.flavor} / {item.composition.right?.flavor}
          </p>
        )}
        <p className="mt-1 text-xs sm:text-sm font-medium">R$ {item.price.toFixed(2)}</p>

        <div className="mt-2 flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto h-8 w-8 text-destructive"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

