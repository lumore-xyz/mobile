import React from "react";
import { Pressable, Text } from "react-native";

export default function CommunityDirectoryChip({
  label,
  selected,
  expand = false,
  disabled = false,
  onPress,
}: {
  label: string;
  selected: boolean;
  expand?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-10 justify-center rounded-full px-3 py-2 ${expand ? "flex-1 items-center" : ""} ${selected ? "bg-ui-forest" : "bg-ui-ink/5"} ${disabled ? "opacity-40" : "active:opacity-75"}`}
    >
      <Text className={`text-xs font-semibold ${selected ? "text-ui-paper" : "text-ui-ink"}`}>
        {label}
      </Text>
    </Pressable>
  );
}
