import CreditsScreen from "@/src/screens/Credits";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";

const Credits = () => {
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
    <CreditsScreen isRefreshing={isRefreshing} onRefresh={handleRefresh} />
  );
};

export default Credits;
