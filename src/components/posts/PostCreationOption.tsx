import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface PostCreationOptionProps {
  title: string;
  description: string;
  icon: string;
  tone: "highlight" | "accent" | "foreground";
  hint: string;
  onPress: () => void;
}

const PostCreationOption = ({
  title,
  description,
  icon,
  tone,
  hint,
  onPress,
}: PostCreationOptionProps) => {
  const toneClass =
    tone === "accent"
      ? "bg-ui-aubergine/10"
      : tone === "foreground"
        ? "bg-ui-midnight/10"
        : "bg-ui-forest/10";
  const iconColor =
    tone === "accent"
      ? COLORS.aubergine
      : tone === "foreground"
        ? COLORS.midnight
        : COLORS.forest;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Create ${title} post`}
      onPress={() => {
        triggerSelectionHaptic();
        onPress();
      }}
      className="min-h-[116px] flex-row items-center gap-4 border-b border-ui-parchment py-5 active:opacity-70"
    >
      <View className={`h-14 w-14 items-center justify-center rounded-[20px] ${toneClass}`}>
        <Icon name={icon} size={23} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-ui-ink">{title}</Text>
        <Text className="mt-1 text-sm leading-5 text-ui-slate">
          {description}
        </Text>
        <Text className="mt-2 text-xs font-semibold text-ui-forest">
          {hint}
        </Text>
      </View>
      <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-forest/5">
        <Icon name="ArrowUpRight" size={17} color={COLORS.forest} />
      </View>
    </Pressable>
  );
};

export default PostCreationOption;
