"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CreateCategoryButtonProps {
  categoryName: string;
  description: string;
  icon?: React.ReactNode;
}

export function CreateCategoryButton({
  categoryName,
  description,
  icon,
}: CreateCategoryButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/categories/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: categoryName,
          description,
        }),
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
      size="sm"
      className="gap-2"
    >
      {icon || <Plus className="h-4 w-4" />}
      {isLoading ? "Criando..." : `Criar ${categoryName}`}
    </Button>
  );
}

