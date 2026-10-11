import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";

interface RoomStatPillProps {
  icon: string;
  label: string;
  isHighlighted?: boolean;
}

export default function RoomStatPill({
  icon,
  label,
  isHighlighted = false,
}: RoomStatPillProps) {
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
        isHighlighted ? "bg-ui-champagne" : "bg-ui-paper/15"
      }`}
    >
      <Icon
        name={icon}
        size={14}
        color={isHighlighted ? COLORS.ink : COLORS.paper}
      />
      <Text
        className={`text-xs font-bold ${
          isHighlighted ? "text-ui-ink" : "text-ui-paper"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}
