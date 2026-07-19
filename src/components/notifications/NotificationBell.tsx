import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import {
  useNotificationUnreadCount,
} from "../../hooks/useNotifications";

interface NotificationBellProps {
  size?: number;
  onPress?: () => void;
  badgeColor?: string;
  iconColor?: string;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 22,
  onPress,
  badgeColor = COLORS.accent,
  iconColor = COLORS.shade,
  className = "",
}) => {
  const { data: unreadCount } = useNotificationUnreadCount();
  const safeCount = Number(unreadCount || 0);
  const display = safeCount > 99 ? "99+" : safeCount > 0 ? String(safeCount) : null;

  const handlePress = () => {
    if (onPress) onPress();
    else router.navigate("/notifications" as any);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open notifications"
      onPress={handlePress}
      hitSlop={8}
      className={`relative h-11 w-11 items-center justify-center rounded-full active:opacity-70 ${className}`}
    >
      <Icon name="Bell" size={size} color={iconColor} />
      {display ? (
        <View
          className="absolute -right-0.5 -top-0.5 min-w-[18px] items-center justify-center rounded-full px-1.5"
          style={{ backgroundColor: badgeColor, minHeight: 18 }}
        >
          <Text className="text-[10px] font-bold text-ui-light">{display}</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

export default NotificationBell;
