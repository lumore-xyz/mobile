import { router, type Href } from "expo-router";

import type { NotificationItem } from "./constants";

const safeString = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

const resolveMatchTarget = (notification: NotificationItem): Href | null => {
  const entityId = safeString(notification.entityId);
  const metadataRoomId =
    typeof notification.metadata === "object" && notification.metadata
      ? safeString((notification.metadata as Record<string, unknown>).roomId)
      : "";
  const roomId = entityId || metadataRoomId;
  if (!roomId) return null;
  return { pathname: "/chat/[roomId]", params: { roomId } };
};

const resolveCommunityTarget = (notification: NotificationItem): Href | null => {
  const entityId = safeString(notification.entityId);
  if (!entityId) return null;
  return { pathname: "/community/[roomId]", params: { roomId: entityId } };
};

const resolveGameTarget = (notification: NotificationItem): Href | null => {
  const entityId = safeString(notification.entityId);
  return entityId ? `/games` : null;
};

const resolveAccountTarget = (): Href => `/(subpage)/settings`;

const resolveFeedbackTarget = (): Href => `/(subpage)/feedback`;

export const resolveNotificationTarget = (
  notification: NotificationItem | null | undefined,
): Href | null => {
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
    router.navigate(target);
    return true;
  } catch (error) {
    console.warn(
      "[notifications] navigateToNotification failed:",
      (error as Error)?.message || error,
    );
    return false;
  }
};
