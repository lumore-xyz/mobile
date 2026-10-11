import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

type ProfileFactProps = {
  icon: string;
  text: string;
};

export default function ProfileFact({ icon, text }: ProfileFactProps) {
  return (
    <View className="flex-row items-center gap-1.5">
      <Icon name={icon} size={16} color={COLORS.slate} />
      <Text className="text-sm font-medium text-ui-slate">{text}</Text>
    </View>
  );
}
