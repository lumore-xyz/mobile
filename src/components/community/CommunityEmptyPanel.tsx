import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";

interface CommunityEmptyPanelProps {
  icon: string;
  title: string;
  copy: string;
}

export default function CommunityEmptyPanel({
  icon,
  title,
  copy,
}: CommunityEmptyPanelProps) {
  return (
    <View className="items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon name={icon} size={24} color={COLORS.forest} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-ink">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
        {copy}
      </Text>
    </View>
  );
}
