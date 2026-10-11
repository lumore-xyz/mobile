import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import invalidateCreditsQueries from "@/src/features/credits/invalidateCreditsQueries";

export default function useCreditsRefresh() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await invalidateCreditsQueries(queryClient);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return { isRefreshing, refresh };
}
