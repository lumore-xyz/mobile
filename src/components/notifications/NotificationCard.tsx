import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
}) => {
  const isUnread = !notification.isRead;
  const target = resolveNotificationTarget(notification);

  const handlePress = useCallback(() => {
    triggerSelectionHaptic();
    if (onPress) onPress(notification);
  }, [notification, onPress]);

  const handleDelete = useCallback(() => {
    triggerSelectionHaptic();
    if (onDelete) onDelete(notification);
  }, [notification, onDelete]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={notification.title}
      accessibilityState={{ selected: isUnread }}
      className={`flex-row items-start gap-3 rounded-2xl border bg-white p-3 ${
        isUnread ? "border-ui-highlight/40" : "border-ui-shade/10"
      }`}
      style={
        isUnread
          ? { backgroundColor: "rgba(124, 58, 237, 0.05)" }
          : undefined
      }
    >
      <NotificationIcon
        entityType={notification.entityType}
        type={notification.type}
      />
      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className={`flex-1 text-base ${
              isUnread ? "font-semibold text-ui-dark" : "font-medium text-ui-dark"
            }`}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text className="text-xs text-ui-shade/60">
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
        <Text className="text-sm text-ui-shade/80" numberOfLines={2}>
          {notification.message}
        </Text>
        <View className="mt-1 flex-row items-center justify-between gap-2">
          <View className="flex-1 flex-row items-center gap-2">
            {isUnread ? (
              <View className="h-2 w-2 rounded-full bg-ui-highlight" />
            ) : null}
            {target ? (
              <Text className="text-xs text-ui-highlight">Tap to open</Text>
            ) : (
              <Text className="text-xs text-ui-shade/50">No link</Text>
            )}
          </View>
          {onDelete ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Delete notification"
              onPress={handleDelete}
              hitSlop={8}
              className="h-8 w-8 items-center justify-center rounded-full bg-ui-shade/5"
            >
              <Icon
                type="Ionicons"
                name="trash-outline"
                size={16}
                color="#6B7280"
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationCard;
