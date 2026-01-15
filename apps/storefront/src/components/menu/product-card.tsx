"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import type { Product, ProductVariant, ProductModifier } from "@pizzaria/db";
import { ProductModal } from "./product-modal";

interface ProductCardProps {
  product: Product & {
    variants: ProductVariant[];
    modifiers: (ProductModifier & {
      modifier: {
        options: Array<{ id: string; name: string; price: number }>;
      };
    })[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addItem } = useCart();

  const defaultVariant = product.variants.find((v) => v.isDefault) || product.variants[0];
  const basePrice = defaultVariant ? Number(defaultVariant.price) : Number(product.basePrice);

  const handleQuickAdd = () => {
    if (product.variants.length === 0 && product.modifiers.length === 0) {
      // Produto simples, adiciona direto
      addItem({
        productId: product.id,
        quantity: 1,
        name: product.name,
        price: basePrice,
        imageUrl: product.imageUrl || undefined,
      });
      // Abre o carrinho após adicionar
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("cart:item-added"));
      }, 100);
    } else {
      // Abre modal para escolher variantes
      setIsModalOpen(true);
    }
  };

  // Imagem padrão baseada no tipo de produto
  const getDefaultImage = () => {
    if (product.imageUrl) return product.imageUrl;
    
    const typeImages: Record<string, string> = {
      PIZZA: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
      DRINK: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop",
      DESSERT: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop",
      COMBO: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    };
    
    return typeImages[product.type] || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop";
  };

  return (
    <>
      <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={getDefaultImage()}
            alt={product.name}
            className="h-full w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-110"
            onClick={() => setIsModalOpen(true)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="p-5">
          <h3 className="mb-2 text-lg font-bold text-gray-900">{product.name}</h3>
          <p className="mb-4 text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
            {product.description || "Delicioso produto da nossa casa"}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">R$ {basePrice.toFixed(2)}</span>
            </div>
            <Button 
              size="sm" 
              onClick={handleQuickAdd}
              className="bg-primary hover:bg-primary/90 transition-colors"
            >
              Adicionar
            </Button>
          </div>
        </div>
      </div>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(item) => {
          addItem(item);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}

