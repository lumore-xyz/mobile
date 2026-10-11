import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function CommunityFilterToggle({
  icon,
  label,
  description,
  selected,
  onPress,
}: {
  icon: string;
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-full flex-row items-center justify-between rounded-[22px] border px-4 py-3 ${selected ? "border-ui-forest/20 bg-ui-forest/10" : "border-ui-parchment bg-ui-paper"}`}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
    >
      <View className="flex-row items-center gap-3">
        <View className={`h-10 w-10 items-center justify-center rounded-full ${selected ? "bg-ui-forest" : "bg-ui-forest/10"}`}>
          <Icon name={icon} size={18} color={selected ? COLORS.paper : COLORS.forest} />
        </View>
        <View>
          <Text className="font-bold text-ui-ink">{label}</Text>
          <Text className="mt-0.5 text-xs text-ui-slate">{description}</Text>
        </View>
      </View>
      <View className={`h-6 w-11 rounded-full p-1 ${selected ? "bg-ui-forest" : "bg-ui-parchment"}`}>
        <View className={`h-4 w-4 rounded-full bg-ui-paper ${selected ? "ml-5" : ""}`} />
      </View>
    </Pressable>
  );
}
