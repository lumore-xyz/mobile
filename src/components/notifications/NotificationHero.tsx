import SurfacePanel from "@/src/components/ui/SurfacePanel";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface NotificationHeroProps {
  unreadCount: number;
  totalCount: number;
  showMarkAll: boolean;
  onMarkAll: () => void;
  isMarkingAll: boolean;
}

const NotificationHero = React.memo(function NotificationHero({
  unreadCount,
  totalCount,
  showMarkAll,
  onMarkAll,
  isMarkingAll,
}: NotificationHeroProps) {
  const hasUnread = unreadCount > 0;
  const countLabel = hasUnread
    ? `${unreadCount} unread ${unreadCount === 1 ? "update" : "updates"}`
    : totalCount > 0
      ? "Everything is read"
      : "A calm inbox";

  return (
    <SurfacePanel surface="midnight" className="mx-4 mt-3 overflow-hidden">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-ui-paper" accessibilityRole="header">
            What needs your attention
          </Text>
          <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
            Matches, messages, feedback, and community moments gathered in one place.
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-champagne">
          <Icon name={hasUnread ? "BellRing" : "Check"} size={20} color={COLORS.ink} />
        </View>
      </View>
      <View className="mt-5 flex-row items-end justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-3xl font-bold text-ui-paper">
            {hasUnread ? unreadCount : totalCount}
          </Text>
          <Text className="mt-0.5 text-sm text-ui-paper/70">{countLabel}</Text>
        </View>
        {showMarkAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
            accessibilityState={{ disabled: isMarkingAll, busy: isMarkingAll }}
            disabled={isMarkingAll}
            onPress={onMarkAll}
            className="min-h-11 items-center justify-center rounded-full bg-ui-paper/10 px-4 active:opacity-75"
          >
            {isMarkingAll ? (
              <ActivityIndicator size="small" color={COLORS.paper} />
            ) : (
              <Text className="text-sm font-semibold text-ui-paper">Mark all</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </SurfacePanel>
  );
});

export default NotificationHero;
