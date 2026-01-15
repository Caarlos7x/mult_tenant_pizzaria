"use client";

import { Check, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { OrderStatus, OrderStatusHistory } from "@pizzaria/db";

const statusLabels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Aguardando Pagamento",
  RECEIVED: "Pedido Recebido",
  CONFIRMED: "Confirmado",
  PREPARING: "Preparando",
  OUT_FOR_DELIVERY: "Saiu para Entrega",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

// Ordem dos status (PENDING_PAYMENT só aparece se for o status atual)
const statusOrder: OrderStatus[] = [
  "RECEIVED",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  statusHistory: OrderStatusHistory[];
}

export function OrderStatusTimeline({ currentStatus, statusHistory }: OrderStatusTimelineProps) {
  const isCanceled = currentStatus === "CANCELED";

  if (isCanceled) {
    return (
      <div className="flex items-center gap-2 text-destructive">
        <Clock className="h-5 w-5" />
        <span className="font-semibold">{statusLabels[currentStatus]}</span>
      </div>
    );
  }

  // Se está em PENDING_PAYMENT, mostra apenas esse status
  if (currentStatus === "PENDING_PAYMENT") {
    const historyItem = statusHistory.find((h) => h.status === "PENDING_PAYMENT");
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-primary">{statusLabels.PENDING_PAYMENT}</p>
            {historyItem && (
              <p className="text-xs text-muted-foreground">
                {formatDate(historyItem.createdAt)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-muted-foreground">{statusLabels.RECEIVED}</p>
          </div>
        </div>
      </div>
    );
  }

  // Para outros status, mostra a timeline normal
  const currentIndex = statusOrder.indexOf(currentStatus);
  const effectiveIndex = currentIndex >= 0 ? currentIndex : -1;

  return (
    <div className="space-y-4">
      {statusOrder.map((status, index) => {
        const isCompleted = index <= effectiveIndex;
        const historyItem = statusHistory.find((h) => h.status === status);
        const isCurrent = index === effectiveIndex;

        return (
          <div key={status} className="flex items-start gap-3">
            <div
              className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full ${
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : "border-2 border-muted-foreground"
              }`}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={`font-medium ${isCurrent ? "text-primary" : isCompleted ? "" : "text-muted-foreground"}`}
              >
                {statusLabels[status]}
              </p>
            {historyItem && (
              <p className="text-xs text-muted-foreground">
                {formatDate(historyItem.createdAt)}
              </p>
            )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

