"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product, ProductVariant, ProductModifier } from "@pizzaria/db";
import type { CartItem } from "@pizzaria/validators";

interface ProductModalProps {
  product: Product & {
    variants: ProductVariant[];
    modifiers: (ProductModifier & {
      modifier: {
        options: Array<{ id: string; name: string; price: number }>;
      };
    })[];
  };
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: CartItem & { name: string; price: number; imageUrl?: string }) => void;
}

export function ProductModal({ product, isOpen, onClose, onAdd }: ProductModalProps) {
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [composition, setComposition] = useState<"FULL" | "HALF_HALF">("FULL");

  if (!isOpen) return null;

  const calculatePrice = () => {
    let price = Number(product.basePrice);

    // Adiciona variantes selecionadas
    selectedVariants.forEach((variantId) => {
      const variant = product.variants.find((v) => v.id === variantId);
      if (variant) {
        price += Number(variant.price);
      }
    });

    // Adiciona modificadores selecionados
    selectedModifiers.forEach((optionId) => {
      product.modifiers.forEach((pm) => {
        const option = pm.modifier.options.find((o) => o.id === optionId);
        if (option) {
          price += Number(option.price);
        }
      });
    });

    return price;
  };

  const handleAdd = () => {
    onAdd({
      productId: product.id,
      quantity,
      variantIds: selectedVariants.length > 0 ? selectedVariants : undefined,
      modifierOptionIds: selectedModifiers.length > 0 ? selectedModifiers : undefined,
      composition:
        composition === "HALF_HALF"
          ? {
              type: "HALF_HALF",
              left: { flavor: product.name, extras: [] },
              right: { flavor: product.name, extras: [] },
            }
          : undefined,
      name: product.name,
      price: calculatePrice(),
      imageUrl: product.imageUrl || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-background shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-background p-3 sm:p-4">
          <h2 className="text-xl sm:text-2xl font-bold truncate pr-2">{product.name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {product.imageUrl && (
            <img src={product.imageUrl} alt={product.name} className="h-48 sm:h-64 w-full rounded object-cover" />
          )}

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          {/* Variantes (tamanhos, bordas, etc.) */}
          {product.variants.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm sm:text-base font-semibold">Escolha o tamanho</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariants([variant.id])}
                    className={`rounded border p-3 text-left transition-colors ${
                      selectedVariants.includes(variant.id)
                        ? "border-primary bg-primary/10"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="font-medium">{variant.name}</div>
                    <div className="text-sm text-muted-foreground">
                      +R$ {Number(variant.price).toFixed(2)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pizza meio-a-meio (apenas para pizzas) */}
          {product.type === "PIZZA" && (
            <div>
              <h3 className="mb-3 text-sm sm:text-base font-semibold">Tipo</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setComposition("FULL")}
                  className={`flex-1 rounded border p-3 ${
                    composition === "FULL" ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  Inteira
                </button>
                <button
                  onClick={() => setComposition("HALF_HALF")}
                  className={`flex-1 rounded border p-3 ${
                    composition === "HALF_HALF" ? "border-primary bg-primary/10" : ""
                  }`}
                >
                  Meio a Meio
                </button>
              </div>
            </div>
          )}

          {/* Modificadores (adicionais) */}
          {product.modifiers.map((pm) => (
            <div key={pm.id}>
              <h3 className="mb-3 text-sm sm:text-base font-semibold">
                {pm.modifier.name}
                {pm.modifier.isRequired && <span className="text-destructive"> *</span>}
              </h3>
              <div className="space-y-2">
                {pm.modifier.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center justify-between rounded border p-3 hover:bg-accent"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type={pm.modifier.maxOptions > 1 ? "checkbox" : "radio"}
                        name={`modifier-${pm.id}`}
                        checked={selectedModifiers.includes(option.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            if (pm.modifier.maxOptions === 1) {
                              // Remove outros da mesma categoria
                              const otherIds = pm.modifier.options.map((o) => o.id);
                              setSelectedModifiers((prev) => [
                                ...prev.filter((id) => !otherIds.includes(id)),
                                option.id,
                              ]);
                            } else {
                              setSelectedModifiers((prev) => [...prev, option.id]);
                            }
                          } else {
                            setSelectedModifiers((prev) => prev.filter((id) => id !== option.id));
                          }
                        }}
                      />
                      <span>{option.name}</span>
                    </div>
                    {Number(option.price) > 0 && (
                      <span className="text-sm font-medium">+R$ {Number(option.price).toFixed(2)}</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Quantidade */}
          <div>
            <h3 className="mb-3 text-sm sm:text-base font-semibold">Quantidade</h3>
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="text-lg font-semibold">{quantity}</span>
              <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                +
              </Button>
            </div>
          </div>

          {/* Preço total */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between text-xl sm:text-2xl font-bold">
              <span>Total</span>
              <span>R$ {(calculatePrice() * quantity).toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full text-sm sm:text-base"
            size="lg"
            onClick={() => {
              handleAdd();
              // Pequeno delay para garantir que o item foi adicionado
              setTimeout(() => {
                // Dispara evento customizado para abrir o carrinho
                window.dispatchEvent(new CustomEvent("cart:item-added"));
              }, 100);
            }}
          >
            Adicionar ao Carrinho
          </Button>
        </div>
      </div>
    </div>
  );
}

