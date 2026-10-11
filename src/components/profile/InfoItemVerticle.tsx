import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";

const InfoItemVerticle = ({
  icon,
  type,
  value,
  size = 24,
}: {
  icon: string;
  type: string;
  size?: number;
  value: string | number;
}) => (
  <View className="min-w-20 flex-row items-center gap-3 border-b border-ui-parchment py-3.5">
    <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-forest/5">
      <Icon name={icon} type={type} size={size} className="" />
    </View>
    <Text className="flex-1 text-base leading-6 text-ui-ink">{value}</Text>
  </View>
);

export default InfoItemVerticle;
