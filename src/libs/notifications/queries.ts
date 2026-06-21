import { getUser } from "../../service/storage";
import {
  NOTIFICATION_PAGINATION,
  NOTIFICATION_SOCKET_EVENTS,
  type NotificationItem,
} from "./constants";

export { NOTIFICATION_PAGINATION, NOTIFICATION_SOCKET_EVENTS };
export type { NotificationItem };

export const NOTIFICATION_QUERY_KEYS = {
  root: ["notifications"] as const,
  infinite: (userId: string | null, pageSize: number) =>
    ["notifications", "infinite", pageSize, userId] as const,
  unreadCount: (userId: string | null) =>
    ["notifications", "unread-count", userId] as const,
};

export const getCurrentUserId = (): string | null => {
  try {
    return getUser()?._id || null;
  } catch {
    return null;
  }
};

export const isNotificationForUser = (
  notification: NotificationItem | null | undefined,
  userId: string | null,
) => Boolean(notification && userId && notification.userId === userId);

export const isUnread = (notification: NotificationItem) =>
  !notification.isRead;

export const clampPageSize = (requested?: number) => {
  const raw = Number(requested) || NOTIFICATION_PAGINATION.DEFAULT_LIMIT;
  return Math.min(Math.max(raw, 1), NOTIFICATION_PAGINATION.MAX_LIMIT);
};
