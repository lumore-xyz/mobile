import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markAllNotificationsAsRead } from "@/src/libs/notifications/api";
import invalidateNotifications from "./invalidateNotifications";

export default function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      void invalidateNotifications(queryClient);
    },
  });
}
