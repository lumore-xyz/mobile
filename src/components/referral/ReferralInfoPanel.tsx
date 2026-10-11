import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

interface ReferralInfoPanelProps {
  icon: string;
  text: string;
}

export default function ReferralInfoPanel({
  icon,
  text,
}: ReferralInfoPanelProps) {
  return (
    <View className="mt-3 flex-row items-start gap-2 rounded-2xl bg-ui-forest/10 p-3">
      <Icon name={icon} size={16} color={COLORS.forest} />
      <Text className="flex-1 text-sm font-medium leading-5 text-ui-ink">
        {text}
      </Text>
    </View>
  );
}
