import ReferralScreen from "@/src/screens/Referral";
import { referralQueryKeys } from "@/src/features/referrals/queryKeys";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";

const Referral = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: referralQueryKeys.summary,
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
