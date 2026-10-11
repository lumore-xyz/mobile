import type { QueryClient } from "@tanstack/react-query";
import { PREFERENCE_MATCH_COUNT_QUERY_KEY } from "@/src/service/query-keys";
import { profileQueryKeys } from "./queryKeys";

export default function invalidateUserProfileQueries(
  queryClient: QueryClient,
  userId: string,
): Promise<void> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: profileQueryKeys.user(userId) }),
    queryClient.invalidateQueries({ queryKey: PREFERENCE_MATCH_COUNT_QUERY_KEY }),
  ]).then(() => undefined);
}
