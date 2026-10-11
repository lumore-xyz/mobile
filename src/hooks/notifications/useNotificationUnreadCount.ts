import { useQuery } from "@tanstack/react-query";

import { fetchUnreadNotificationCount } from "@/src/libs/notifications/api";
import {
  NOTIFICATION_QUERY_KEYS,
  getCurrentUserId,
} from "@/src/libs/notifications/queries";

export default function useNotificationUnreadCount() {
  const userId = getCurrentUserId();

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(userId),
    queryFn: fetchUnreadNotificationCount,
    enabled: Boolean(userId),
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
}
