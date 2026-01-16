"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import type { Category } from "@pizzaria/db";

interface ProductsFilterProps {
  categories: Category[];
}

export function ProductsFilter({ categories }: ProductsFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );

  const handleCategoryChange = (categoryId: string) => {
    // Atualiza o estado local imediatamente (otimista)
    setSelectedCategory(categoryId);

    // Atualiza a URL de forma não-bloqueante
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (categoryId === "all") {
        params.delete("category");
      } else {
        params.set("category", categoryId);
      }
      
      // Reset para página 1 ao mudar categoria
      params.delete("page");
      
      router.push(`/admin/products?${params.toString()}`);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4" />
          <span>Filtrar por:</span>
        </div>
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange("all")}
          disabled={isPending}
          className="text-sm"
        >
          Todas
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryChange(category.id)}
            disabled={isPending}
            className="text-sm"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}

