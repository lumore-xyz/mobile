import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface NotificationHeaderProps {
  onClose: () => void;
  showMarkAll: boolean;
  onMarkAll?: () => void;
  isMarkingAll?: boolean;
}

const NotificationHeader = React.memo(function NotificationHeader({
  onClose,
  showMarkAll,
  onMarkAll,
  isMarkingAll = false,
}: NotificationHeaderProps) {
  return (
    <View className="h-16 flex-row items-center justify-between border-b border-ui-parchment bg-ui-paper px-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close notifications"
        onPress={onClose}
        className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest/5 active:opacity-70"
      >
        <Icon name="X" size={20} color={COLORS.ink} />
      </Pressable>
      <Text className="text-base font-semibold text-ui-ink">Notifications</Text>
      {(showMarkAll || isMarkingAll) && onMarkAll ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Mark all read"
          onPress={onMarkAll}
          disabled={isMarkingAll}
          accessibilityState={{ disabled: isMarkingAll, busy: isMarkingAll }}
          className="min-h-11 items-center justify-center rounded-full bg-ui-forest/10 px-3 active:opacity-70"
        >
          {isMarkingAll ? (
            <ActivityIndicator size="small" color={COLORS.forest} />
          ) : (
            <Text className="text-xs font-semibold text-ui-forest">Mark all read</Text>
          )}
        </Pressable>
      ) : (
        <View className="w-10" />
      )}
    </View>
  );
});

export default NotificationHeader;
