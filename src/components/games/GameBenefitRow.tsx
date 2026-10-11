import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

const GameBenefitRow = ({
  icon,
  text,
}: {
  icon: string;
  text: string;
}) => (
  <View className="flex-row items-center gap-3 rounded-2xl bg-ui-paper p-3">
    <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-forest/10">
      <Icon name={icon} size={16} color={COLORS.forest} />
    </View>
    <Text className="flex-1 text-sm leading-5 text-ui-ink">{text}</Text>
  </View>
);

export default GameBenefitRow;
