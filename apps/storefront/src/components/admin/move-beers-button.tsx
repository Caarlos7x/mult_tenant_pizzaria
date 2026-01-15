"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Beer } from "lucide-react";

export function MoveBeersButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMove = async () => {
    if (!confirm("Deseja mover todas as cervejas para a categoria 'Bebidas Alcóolicas'?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/categories/create-alcoholic", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao mover cervejas");
      }

      alert(data.message || "Cervejas movidas com sucesso!");
      
      // Recarrega a página após 1 segundo
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error: any) {
      alert(error.message || "Erro ao mover cervejas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMove}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Beer className="h-4 w-4" />
      {isLoading ? "Movendo..." : "Mover Cervejas"}
    </Button>
  );
}

