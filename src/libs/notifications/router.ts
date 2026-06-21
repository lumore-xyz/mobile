import { router } from "expo-router";

import type { NotificationItem } from "./constants";

const safeString = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const resolveMatchTarget = (notification: NotificationItem) => {
  const entityId = safeString(notification.entityId);
  const metadataRoomId =
    typeof notification.metadata === "object" && notification.metadata
      ? safeString((notification.metadata as Record<string, unknown>).roomId)
      : "";
  const roomId = entityId || metadataRoomId;
  if (!roomId) return null;
  return `/chat/${roomId}`;
};

const resolveCommunityTarget = (notification: NotificationItem) => {
  const entityId = safeString(notification.entityId);
  if (!entityId) return null;
  return `/community/${entityId}`;
};

const resolveGameTarget = (notification: NotificationItem) => {
  const entityId = safeString(notification.entityId);
  return entityId ? `/games` : null;
};

const resolveAccountTarget = () => `/(subpage)/settings`;

const resolveFeedbackTarget = () => `/(subpage)/feedback`;

export const resolveNotificationTarget = (
  notification: NotificationItem | null | undefined,
) => {
  if (!notification) return null;
  const entityType = safeString(notification.entityType);
  switch (entityType) {
    case "match":
      return resolveMatchTarget(notification);
    case "community":
      return resolveCommunityTarget(notification);
    case "feedback":
      return resolveFeedbackTarget();
    case "game":
      return resolveGameTarget(notification);
    case "account":
      return resolveAccountTarget();
    case "system":
    default:
      return null;
  }
};

export const navigateToNotification = (
  notification: NotificationItem | null | undefined,
) => {
  const target = resolveNotificationTarget(notification);
  if (!target) return false;
  try {
    router.navigate(target as any);
    return true;
  } catch (error) {
    console.warn(
      "[notifications] navigateToNotification failed:",
      (error as Error)?.message || error,
    );
    return false;
  }
};
