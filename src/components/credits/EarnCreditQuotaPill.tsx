import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

interface EarnCreditQuotaPillProps {
  icon: string;
  label: string;
  value: string;
}

export default function EarnCreditQuotaPill({
  icon,
  label,
  value,
}: EarnCreditQuotaPillProps) {
  return (
    <View className="flex-1 rounded-[22px] bg-ui-surface-page p-3">
      <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon name={icon} size={16} color={COLORS.forest} />
      </View>
      <Text className="text-xs font-semibold text-ui-slate">{label}</Text>
      <Text className="mt-1 text-sm font-bold text-ui-ink">{value}</Text>
    </View>
  );
}
