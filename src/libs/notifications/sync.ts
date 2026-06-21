import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { useSocket } from "../../service/context/SocketContext";
import {
  NOTIFICATION_QUERY_KEYS,
  NOTIFICATION_SOCKET_EVENTS,
  getCurrentUserId,
  isNotificationForUser,
  type NotificationItem,
} from "./queries";

interface UseNotificationSocketSyncOptions {
  enabled?: boolean;
}

/**
 * Subscribes to the backend's notification socket events and keeps the
 * React Query cache in sync. Mounted once at the app root so every screen
 * that reads notifications gets free, real-time updates.
 */
export const useNotificationSocketSync = (
  options: UseNotificationSocketSyncOptions = {},
) => {
  const enabled = options.enabled !== false;
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const userId = getCurrentUserId();

  useEffect(() => {
    if (!enabled || !socket || !userId) return undefined;

    const invalidateList = () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.root,
      });
    };

    const handleCreated = (payload: NotificationItem) => {
      if (!isNotificationForUser(payload, userId)) return;
      invalidateList();
    };

    const handleUpdated = (payload: NotificationItem) => {
      if (!isNotificationForUser(payload, userId)) return;
      invalidateList();
    };

    const handleDeleted = (payload: { id?: string }) => {
      // Deletion events carry only the id; we can't verify ownership server-
      // side so we always invalidate. The list query filters by the current
      // user so the worst case is one wasted invalidation cycle.
      if (!payload?.id) return;
      invalidateList();
    };

    const handleUnreadCount = (payload: { unreadCount?: number }) => {
      const next = Number(payload?.unreadCount || 0);
      queryClient.setQueryData(
        NOTIFICATION_QUERY_KEYS.unreadCount(userId),
        next,
      );
    };

    socket.on(NOTIFICATION_SOCKET_EVENTS.CREATED, handleCreated);
    socket.on(NOTIFICATION_SOCKET_EVENTS.UPDATED, handleUpdated);
    socket.on(NOTIFICATION_SOCKET_EVENTS.DELETED, handleDeleted);
    socket.on(NOTIFICATION_SOCKET_EVENTS.UNREAD_COUNT, handleUnreadCount);

    return () => {
      socket.off(NOTIFICATION_SOCKET_EVENTS.CREATED, handleCreated);
      socket.off(NOTIFICATION_SOCKET_EVENTS.UPDATED, handleUpdated);
      socket.off(NOTIFICATION_SOCKET_EVENTS.DELETED, handleDeleted);
      socket.off(NOTIFICATION_SOCKET_EVENTS.UNREAD_COUNT, handleUnreadCount);
    };
  }, [enabled, queryClient, socket, userId]);
};
