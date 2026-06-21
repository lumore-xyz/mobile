export const NOTIFICATION_TYPES = Object.freeze([
  "MATCH_CREATED",
  "MATCH_CREATED_FROM_COMMUNITY",
  "FEEDBACK_RECEIVED",
  "ACCOUNT_VERIFICATION_APPROVED",
  "ACCOUNT_VERIFICATION_COMPLETED",
  "ACCOUNT_VERIFICATION_REVOKED",
  "ACCOUNT_VERIFICATION_REJECTED",
  "GAME_SUBMISSION_APPROVED",
  "GAME_SUBMISSION_REJECTED",
  "COMMUNITY_JOINED",
  "COMMUNITY_INVITE_RECEIVED",
  "COMMUNITY_ROLE_UPDATED",
  "SYSTEM_MESSAGE",
]);

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_ENTITY_TYPES = Object.freeze([
  "match",
  "community",
  "feedback",
  "game",
  "account",
  "system",
]);

export type NotificationEntityType =
  (typeof NOTIFICATION_ENTITY_TYPES)[number];

export interface NotificationItem {
  id: string;
  userId: string;
  actorId: string | null;
  type: NotificationType | string;
  title: string;
  message: string;
  entityType: NotificationEntityType | string | null;
  entityId: string | null;
  metadata: Record<string, any>;
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
