import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

const CreditMiniStat = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View className="flex-1 rounded-[24px] border border-ui-parchment bg-ui-paper p-4">
    <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
      <Icon name={icon} size={18} color={COLORS.forest} />
    </View>
    <Text className="text-sm font-semibold text-ui-slate">{label}</Text>
    <Text className="mt-1 text-base font-bold text-ui-ink">{value}</Text>
  </View>
);

export default CreditMiniStat;
