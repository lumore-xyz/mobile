import { useQuery } from "@tanstack/react-query";
import apiClient from "../service/api-client";
import type { ProfilePost } from "../domain/profile/types";

const fetchUserPosts = async (userId: string) => {
  const { data } = await apiClient.get<ProfilePost[]>(`/post/${userId}`);
  return data;
};

export const useUserPosts = (userId: string) => {
  const {
    data: posts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user posts", userId],
    queryFn: () => fetchUserPosts(userId),
    enabled: Boolean(userId),
  });

  return {
    posts,
    isLoading,
    error,
  };
};
