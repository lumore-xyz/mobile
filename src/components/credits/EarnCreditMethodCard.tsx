import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

interface EarnCreditMethodCardProps {
  title: string;
  icon: string;
  amount: string;
  description: string;
}

export default function EarnCreditMethodCard({
  title,
  icon,
  amount,
  description,
}: EarnCreditMethodCardProps) {
  return (
    <View className="rounded-[22px] bg-ui-paper p-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 flex-row items-start gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
            <Icon name={icon} size={18} color={COLORS.forest} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-ui-ink">{title}</Text>
            <Text className="mt-1 text-sm leading-5 text-ui-slate">
              {description}
            </Text>
          </View>
        </View>
        <View className="rounded-full bg-ui-champagne px-3 py-1">
          <Text className="text-sm font-bold text-ui-ink">{amount}</Text>
        </View>
      </View>
    </View>
  );
}
