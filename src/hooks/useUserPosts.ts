import { useQuery } from "@tanstack/react-query";
import { fetchUserPosts } from "@/src/features/profile/api";
import { profileQueryKeys } from "@/src/features/profile/queryKeys";

export const useUserPosts = (userId: string) => {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: profileQueryKeys.posts(userId),
    queryFn: () => fetchUserPosts(userId),
    enabled: Boolean(userId),
  });

  return {
    posts,
    isLoading,
    error,
  };
};
