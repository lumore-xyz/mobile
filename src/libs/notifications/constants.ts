export interface NotificationItem {
  id: string;
  userId: string;
  actorId: string | null;
  type: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  unreadCount: number;
}

export const NOTIFICATION_SOCKET_EVENTS = Object.freeze({
  CREATED: "notification_created",
  UPDATED: "notification_updated",
  DELETED: "notification_deleted",
  UNREAD_COUNT: "notification_unread_count",
});

export const NOTIFICATION_PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});
