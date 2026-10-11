import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Pressable, Text } from "react-native";

interface ReferralCopyActionProps {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}

export default function ReferralCopyAction({
  icon,
  label,
  onPress,
  disabled,
  primary = false,
}: ReferralCopyActionProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full px-4 ${
        primary ? "bg-ui-forest" : "border border-ui-forest/25 bg-ui-paper"
      } ${disabled ? "opacity-60" : "active:opacity-80"}`}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
    >
      <Icon
        name={icon}
        size={17}
        color={primary ? COLORS.paper : COLORS.forest}
      />
      <Text className={`font-semibold ${primary ? "text-ui-paper" : "text-ui-forest"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
