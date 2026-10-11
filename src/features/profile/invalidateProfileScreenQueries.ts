import type { QueryClient } from "@tanstack/react-query";
import { thisOrThatQueryKeys } from "@/src/features/this-or-that/queryKeys";
import { profileQueryKeys } from "./queryKeys";

export default function invalidateProfileScreenQueries(
  queryClient: QueryClient,
  userId: string,
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: profileQueryKeys.user(userId) }),
    queryClient.invalidateQueries({ queryKey: profileQueryKeys.posts(userId) }),
    queryClient.invalidateQueries({ queryKey: profileQueryKeys.preferences(userId) }),
    queryClient.invalidateQueries({ queryKey: thisOrThatQueryKeys.answers(userId) }),
  ]).then(() => undefined);
}
