import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import {
  useNotificationUnreadCount,
} from "../../hooks/useNotifications";

interface NotificationBellProps {
  size?: number;
  onPress?: () => void;
  badgeColor?: string;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  size = 22,
  onPress,
  badgeColor = "#E11D48",
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
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Open notifications"
      onPress={handlePress}
      hitSlop={8}
      className={`relative h-11 w-11 items-center justify-center rounded-full ${className}`}
    >
      <Ionicons name="notifications-outline" size={size} color="#111827" />
      {display ? (
        <View
          className="absolute -right-0.5 -top-0.5 min-w-[18px] items-center justify-center rounded-full px-1.5"
          style={{ backgroundColor: badgeColor, minHeight: 18 }}
        >
          <Text className="text-[10px] font-bold text-white">{display}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

export default NotificationBell;
