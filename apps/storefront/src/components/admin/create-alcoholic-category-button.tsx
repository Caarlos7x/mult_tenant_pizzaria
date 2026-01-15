"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Beer } from "lucide-react";

export function CreateAlcoholicCategoryButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/categories/create-alcoholic", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar categoria");
      }

      alert(data.message || "Categoria criada com sucesso!");
      
      // Recarrega a página após 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      alert(error.message || "Erro ao criar categoria");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={isLoading}
      variant="outline"
      className="gap-2"
    >
      <Beer className="h-4 w-4" />
      {isLoading ? "Criando..." : "Criar Bebidas Alcóolicas"}
    </Button>
  );
}

