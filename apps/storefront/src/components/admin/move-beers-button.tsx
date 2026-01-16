"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Beer, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function MoveBeersButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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

      // Usa startTransition para revalidação não-bloqueante
      startTransition(() => {
        router.refresh();
      });
      
      toast.success(data.message || "Cervejas movidas com sucesso!", {
        description: `${data.movedCount || 0} cerveja(s) movida(s) para a categoria 'Bebidas Alcóolicas'`,
      });
    } catch (error: any) {
      toast.error("Erro ao mover cervejas", {
        description: error.message || "Ocorreu um erro ao processar a solicitação",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMove}
      disabled={isLoading || isPending}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Beer className="h-4 w-4" />
      )}
      {isLoading ? "Movendo..." : "Mover Cervejas"}
    </Button>
  );
}

