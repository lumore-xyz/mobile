import EarnCreditsScreen from "@/src/screens/EarnCredits";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";

const EarnCredits = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["credits", "balance"] }),
        queryClient.invalidateQueries({ queryKey: ["credits", "history"] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <EarnCreditsScreen isRefreshing={isRefreshing} onRefresh={handleRefresh} />
  );
};

export default EarnCredits;
