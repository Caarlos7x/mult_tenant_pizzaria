import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface UseOptimisticActionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  revalidatePath?: string;
}

export function useOptimisticAction(options: UseOptimisticActionOptions = {}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<Error | null>(null);

  const execute = async (
    action: () => Promise<Response>,
    optimisticUpdate?: () => void
  ) => {
    setError(null);

    // Aplica atualização otimista imediatamente
    if (optimisticUpdate) {
      optimisticUpdate();
    }

    try {
      const response = await action();

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erro na operação");
      }

      // Revalida apenas o caminho específico em vez de toda a página
      startTransition(() => {
        if (options.revalidatePath) {
          router.refresh();
        }
        options.onSuccess?.();
      });
    } catch (err: any) {
      setError(err);
      options.onError?.(err);
      throw err;
    }
  };

  return {
    execute,
    isPending,
    error,
  };
}

