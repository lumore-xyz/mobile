import type { UsernameAvailabilityStatus } from "@/src/hooks/useUsernameAvailability";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface UsernameAvailabilityFeedbackProps {
  status: UsernameAvailabilityStatus;
  message: string;
  isChecking: boolean;
}

const STATUS_STYLES: Record<UsernameAvailabilityStatus, { color: string; icon?: string }> = {
  idle: { color: COLORS.slate, icon: "Info" },
  invalid: { color: COLORS.danger, icon: "CircleAlert" },
  current: { color: COLORS.slate, icon: "CircleUserRound" },
  checking: { color: COLORS.forest },
  available: { color: COLORS.forest, icon: "CircleCheck" },
  taken: { color: COLORS.danger, icon: "CircleX" },
  error: { color: COLORS.aubergine, icon: "TriangleAlert" },
};

export default function UsernameAvailabilityFeedback({
  status,
  message,
  isChecking,
}: UsernameAvailabilityFeedbackProps) {
  if (!message) return null;

  const style = STATUS_STYLES[status];
  return (
    <View className="mt-2 flex-row items-center gap-2">
      {isChecking ? (
        <ActivityIndicator size="small" color={style.color} />
      ) : style.icon ? (
        <Icon name={style.icon} size={16} color={style.color} />
      ) : null}
      <Text className="text-sm" style={{ color: style.color }}>
        {message}
      </Text>
    </View>
  );
}
