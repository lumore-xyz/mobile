import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

const SettingsNavigationItem = ({
  icon,
  label,
  description,
  onPress,
}: {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={() => {
      triggerSelectionHaptic();
      onPress();
    }}
    className="mt-3 min-h-16 flex-row items-center justify-between gap-3 rounded-[22px] bg-ui-paper p-4 active:opacity-80"
    android_ripple={{ color: `${COLORS.forest}10`, borderless: false }}
    accessibilityRole="button"
    accessibilityLabel={`Open ${label}`}
  >
    <View className="flex-1 flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon name={icon} size={18} color={COLORS.forest} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ui-ink">{label}</Text>
        <Text className="mt-0.5 text-sm leading-5 text-ui-slate">
          {description}
        </Text>
      </View>
    </View>
    <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-surface-page">
      <Icon name="ChevronRight" size={17} color={COLORS.slate} />
    </View>
  </Pressable>
);

export default SettingsNavigationItem;
