import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";

export default function RoomMeta({
  icon,
  text,
  isHighlighted = false,
}: {
  icon: string;
  text: string;
  isHighlighted?: boolean;
}) {
  return (
    <View className={`max-w-full flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${isHighlighted ? "bg-ui-champagne/30" : "bg-ui-ink/5"}`}>
      <Icon name={icon} size={14} color={isHighlighted ? COLORS.ink : COLORS.slate} />
      <Text className={`max-w-[210px] text-xs font-semibold ${isHighlighted ? "text-ui-ink" : "text-ui-slate"}`} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}
