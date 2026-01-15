"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface OrderStatusUpdaterProps {
  orderId: string;
  currentStatus: string;
}

const statusOptions = [
  { value: "RECEIVED", label: "Recebido" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PREPARING", label: "Preparando" },
  { value: "OUT_FOR_DELIVERY", label: "Saiu para Entrega" },
  { value: "DELIVERED", label: "Entregue" },
  { value: "CANCELED", label: "Cancelado" },
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: OrderStatusUpdaterProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar status");
      }

      setSuccess(true);
      router.refresh();

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alterar Status do Pedido
        </label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const isCurrent = option.value === currentStatus;
            const isDisabled =
              isLoading ||
              isCurrent ||
              (currentStatus === "DELIVERED" && option.value !== "DELIVERED") ||
              (currentStatus === "CANCELED" && option.value !== "CANCELED");

            return (
              <Button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                disabled={isDisabled}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                className={
                  isCurrent
                    ? "bg-primary text-white"
                    : "hover:bg-primary/10 hover:text-primary"
                }
              >
                {isLoading && isCurrent && (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                )}
                {option.label}
              </Button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          Status atualizado com sucesso!
        </div>
      )}
    </div>
  );
}

