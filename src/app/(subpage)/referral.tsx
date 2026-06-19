import ReferralScreen from "@/src/screens/Referral";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";

const Referral = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ["referral", "summary"],
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <ReferralScreen isRefreshing={isRefreshing} onRefresh={handleRefresh} />
  );
};

export default Referral;
