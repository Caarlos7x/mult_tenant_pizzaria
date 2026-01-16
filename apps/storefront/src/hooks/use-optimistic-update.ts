import { useTransition, useOptimistic } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook para atualizações otimistas
 * Atualiza a UI imediatamente antes da resposta do servidor
 */
export function useOptimisticUpdate<T>(
  initialData: T,
  updateFn: (current: T, optimisticValue: T) => T
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticData, setOptimisticData] = useOptimistic(
    initialData,
    updateFn
  );

  const update = async (
    optimisticValue: T,
    serverAction: () => Promise<void>
  ) => {
    // Atualiza otimisticamente
    setOptimisticData(optimisticValue);

    try {
      // Executa a ação no servidor
      await serverAction();

      // Revalida os dados
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      // Em caso de erro, reverte para o estado anterior
      setOptimisticData(initialData);
      throw error;
    }
  };

  return {
    data: optimisticData,
    update,
    isPending,
  };
}

