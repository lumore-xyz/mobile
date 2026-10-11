import React, { useCallback } from "react";
import { GestureResponderEvent, Pressable, Text, View } from "react-native";
import formatRelativeTime from "@/src/utils/helpers/formatRelativeTime";

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
          ? "border-ui-forest/25 bg-ui-forest/5"
          : "border-ui-parchment bg-ui-paper"
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
              isUnread ? "font-bold text-ui-ink" : "font-semibold text-ui-ink"
            }`}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text className="text-xs font-medium text-ui-slate">
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
        <Text className="text-sm leading-5 text-ui-slate" numberOfLines={3}>
          {notification.message}
        </Text>
        <View className="mt-1 flex-row items-center justify-between gap-2">
          <View className="flex-1 flex-row items-center gap-2">
            {isUnread ? (
              <View className="h-2 w-2 rounded-full bg-ui-forest" />
            ) : null}
            {target ? (
              <View className="flex-row items-center gap-1">
                <Text className="text-xs font-medium text-ui-forest">Open</Text>
                <Icon name="ArrowUpRight" size={12} color={COLORS.forest} />
              </View>
            ) : (
              <Text className="text-xs text-ui-slate">Update only</Text>
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
              className={`h-11 w-11 items-center justify-center rounded-full active:bg-ui-danger/5 ${isDeleting ? "opacity-40" : ""}`}
            >
              <Icon
                name="Trash"
                size={16}
                color={COLORS.slate}
              />
            </Pressable>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

export default NotificationCard;
