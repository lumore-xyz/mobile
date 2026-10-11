import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import React from "react";
import { Pressable, Text } from "react-native";

const ActionPill = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={() => {
      triggerSelectionHaptic();
      onPress();
    }}
    className="min-h-12 flex-row items-center gap-2 rounded-full bg-ui-forest/5 px-3.5 py-2.5 active:opacity-70"
    hitSlop={4}
    accessibilityRole="button"
    accessibilityLabel={`Open ${label}`}
  >
    <Icon name={icon} size={16} color={COLORS.forest} />
    <Text className="text-sm font-medium text-ui-ink">{label}</Text>
  </Pressable>
);

export default ActionPill;
