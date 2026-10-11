import { useQuery } from "@tanstack/react-query";
import { fetchUserPreferences } from "@/src/features/profile/api";
import { profileQueryKeys } from "@/src/features/profile/queryKeys";

export const useUserPrefrence = (userId: string) => {
  const {
    data: userPrefrence,
    isLoading,
    error,
  } = useQuery({
    queryKey: profileQueryKeys.preferences(userId),
    queryFn: () => fetchUserPreferences(userId),
    enabled: Boolean(userId),
  });

  return {
    userPrefrence,
    isLoading,
    error,
  };
};
