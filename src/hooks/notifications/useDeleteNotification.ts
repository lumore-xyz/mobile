import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteNotification } from "@/src/libs/notifications/api";
import invalidateNotifications from "./invalidateNotifications";

export default function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      void invalidateNotifications(queryClient);
    },
  });
}
