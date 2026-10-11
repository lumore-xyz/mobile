import type { QueryClient } from "@tanstack/react-query";

import { communityQueryKeys } from "./queryKeys";

export default function invalidateCommunityQueries(
  queryClient: QueryClient,
): void {
  void queryClient.invalidateQueries({ queryKey: communityQueryKeys.all });
}
