import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ExploreProfileCompletionCardProps {
  title: string;
  description: string;
  accessibilityLabel: string;
  accessibilityHint?: string;
  className: string;
  onPress: () => void;
}

export default function ExploreProfileCompletionCard({
  title,
  description,
  accessibilityLabel,
  accessibilityHint,
  className,
  onPress,
}: ExploreProfileCompletionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={className}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon name="BadgeCheck" size={18} color={COLORS.forest} />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-ui-ink">{title}</Text>
        <Text className="mt-0.5 text-xs leading-4 text-ui-slate">
          {description}
        </Text>
      </View>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest">
        <Icon name="ArrowRight" size={17} color={COLORS.paper} />
      </View>
    </Pressable>
  );
}
