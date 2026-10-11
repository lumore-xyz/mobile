import type { QueryClient } from "@tanstack/react-query";

import { NOTIFICATION_QUERY_KEYS } from "@/src/libs/notifications/queries";

export default function invalidateNotifications(
  queryClient: QueryClient,
): Promise<void> {
  return queryClient.invalidateQueries({
    queryKey: NOTIFICATION_QUERY_KEYS.root,
  });
}
