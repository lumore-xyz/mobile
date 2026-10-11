import { useMutation, useQueryClient } from "@tanstack/react-query";

import { markNotificationAsRead } from "@/src/libs/notifications/api";
import invalidateNotifications from "./invalidateNotifications";

export default function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      void invalidateNotifications(queryClient);
    },
  });
}
