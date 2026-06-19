import FeedbackScreen from "@/src/screens/Feedback";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";

const Feedback = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ["feedback", "received"],
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <FeedbackScreen isRefreshing={isRefreshing} onRefresh={handleRefresh} />
  );
};

export default Feedback;
