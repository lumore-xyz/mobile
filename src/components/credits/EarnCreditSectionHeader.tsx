import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

interface EarnCreditSectionHeaderProps {
  icon: string;
  title: string;
  description: string;
}

export default function EarnCreditSectionHeader({
  icon,
  title,
  description,
}: EarnCreditSectionHeaderProps) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon name={icon} size={18} color={COLORS.forest} />
      </View>
      <View className="flex-1">
        <Text className="text-xl font-bold text-ui-ink">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-ui-slate">
          {description}
        </Text>
      </View>
    </View>
  );
}
