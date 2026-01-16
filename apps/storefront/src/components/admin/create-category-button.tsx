"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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

      toast.success(data.message || "Categoria criada com sucesso!", {
        description: `A categoria "${categoryName}" foi adicionada ao sistema`,
      });
      
      // Revalida a página de forma não-bloqueante
      startTransition(() => {
        router.refresh();
      });
    } catch (error: any) {
      toast.error("Erro ao criar categoria", {
        description: error.message || "Ocorreu um erro ao processar a solicitação",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreate}
      disabled={isLoading || isPending}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {icon || <Plus className="h-4 w-4" />}
      {isLoading ? "Criando..." : `Criar ${categoryName}`}
    </Button>
  );
}

