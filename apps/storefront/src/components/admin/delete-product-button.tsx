"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao deletar produto");
      }

      // Mostra mensagem de sucesso no modal
      if (data.deletedOrderItems > 0) {
        setSuccess(data.message || `Produto deletado com sucesso! ${data.deletedOrderItems} item(ns) de pedido(s) também foram removido(s).`);
      } else {
        setSuccess(data.message || "Produto deletado com sucesso!");
      }

      // Mostra toast de sucesso
      if (data.deletedOrderItems > 0) {
        toast.success("Produto deletado", {
          description: `${data.deletedOrderItems} item(ns) de pedido(s) também foram removido(s)`,
        });
      } else {
        toast.success("Produto deletado com sucesso");
      }

      // Aguarda 1 segundo para mostrar a mensagem de sucesso antes de fechar
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
        // Usa startTransition para revalidação não-bloqueante
        startTransition(() => {
          router.refresh();
        });
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Erro ao deletar produto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
        Excluir
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!isLoading && !success) {
            setIsOpen(false);
            setError(null);
            setSuccess(null);
          }
        }}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-base text-gray-900 mb-2">
                Tem certeza que deseja excluir o produto <strong>"{productName}"</strong>?
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Esta ação não pode ser desfeita. O produto será permanentemente removido do banco de dados.
              </p>
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                <strong>Atenção:</strong> Se este produto estiver associado a pedidos, todos os itens de pedidos relacionados também serão removidos permanentemente.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <svg
                className="h-5 w-5 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {success}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            {!success && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                  setSuccess(null);
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading || success || isPending}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : success ? (
                "Fechando..."
              ) : (
                "Excluir"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

