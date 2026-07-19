import React, { useCallback } from "react";
import { GestureResponderEvent, Pressable, Text, View } from "react-native";

import { COLORS } from "../../libs/constants/theme";
import Icon from "../../libs/Icon";
import {
  resolveNotificationTarget,
} from "../../libs/notifications/router";
import type { NotificationItem } from "../../libs/notifications/constants";
import { triggerSelectionHaptic } from "../../utils/haptics";
import NotificationIcon from "./NotificationIcon";

interface NotificationCardProps {
  notification: NotificationItem;
  onPress?: (notification: NotificationItem) => void;
  onDelete?: (notification: NotificationItem) => void;
  isDeleting?: boolean;
}

const formatRelativeTime = (iso?: string | null) => {
  if (!iso) return "";
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return "";
  const now = Date.now();
  const diff = Math.max(0, now - target);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onPress,
  onDelete,
  isDeleting = false,
}) => {
  const isUnread = !notification.isRead;
  const target = resolveNotificationTarget(notification);

  const handlePress = useCallback(() => {
    triggerSelectionHaptic();
    if (onPress) onPress(notification);
  }, [notification, onPress]);

  const handleDelete = useCallback((event: GestureResponderEvent) => {
    event.stopPropagation();
    triggerSelectionHaptic();
    if (onDelete) onDelete(notification);
  }, [notification, onDelete]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${isUnread ? "Unread notification. " : ""}${notification.title}. ${notification.message}`}
      accessibilityState={{ selected: isUnread }}
      className={`flex-row items-start gap-3 rounded-[24px] border p-4 active:opacity-75 ${
        isUnread
          ? "border-ui-highlight/25 bg-ui-highlight/5"
          : "border-ui-border bg-ui-light"
      }`}
    >
      <NotificationIcon
        entityType={notification.entityType}
        type={notification.type}
      />
      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className={`flex-1 text-base leading-5 ${
              isUnread ? "font-bold text-ui-shade" : "font-semibold text-ui-shade"
            }`}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text className="text-xs font-medium text-ui-muted">
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
        <Text className="text-sm leading-5 text-ui-muted" numberOfLines={3}>
          {notification.message}
        </Text>
        <View className="mt-1 flex-row items-center justify-between gap-2">
          <View className="flex-1 flex-row items-center gap-2">
            {isUnread ? (
              <View className="h-2 w-2 rounded-full bg-ui-highlight" />
            ) : null}
            {target ? (
              <View className="flex-row items-center gap-1">
                <Text className="text-xs font-medium text-ui-highlight">Open</Text>
                <Icon name="ArrowUpRight" size={12} color={COLORS.highlight} />
              </View>
            ) : (
              <Text className="text-xs text-ui-muted">Update only</Text>
            )}
          </View>
          {onDelete ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete notification"
              onPress={handleDelete}
              disabled={isDeleting}
              hitSlop={8}
              accessibilityState={{ disabled: isDeleting, busy: isDeleting }}
              className={`h-11 w-11 items-center justify-center rounded-full active:bg-red-50 ${isDeleting ? "opacity-40" : ""}`}
            >
              <Icon
                name="Trash"
                size={16}
                color={COLORS.muted}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

export default NotificationCard;
