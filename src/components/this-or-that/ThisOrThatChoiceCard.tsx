import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ThisOrThatChoiceCardProps {
  accent: "accent" | "highlight";
  disabled: boolean;
  imageUrl?: string;
  label: string;
  sideLabel: string;
  onPress: () => void;
}

export default function ThisOrThatChoiceCard({
  accent,
  disabled,
  imageUrl,
  label,
  sideLabel,
  onPress,
}: ThisOrThatChoiceCardProps) {
  const isRose = accent === "accent";
  const iconColor = isRose ? COLORS.aubergine : COLORS.forest;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="min-h-[104px] overflow-hidden rounded-[26px] border border-ui-parchment bg-ui-surface-page active:opacity-85 disabled:opacity-60"
      accessibilityRole="button"
      accessibilityLabel={`Choose ${label}`}
      accessibilityState={{ disabled }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-44 w-full"
          contentFit="cover"
        />
      ) : null}
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View
            className={`rounded-full px-3 py-1 ${
              isRose ? "bg-ui-aubergine/10" : "bg-ui-forest/10"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                isRose ? "text-ui-aubergine" : "text-ui-forest"
              }`}
            >
              {sideLabel}
            </Text>
          </View>
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              isRose ? "bg-ui-aubergine/10" : "bg-ui-forest/10"
            }`}
          >
            <Icon name="Heart" size={17} color={iconColor} />
          </View>
        </View>
        <Text className="mt-4 text-xl font-semibold leading-7 text-ui-ink">
          {label}
        </Text>
        <View className="mt-4 flex-row items-center gap-2">
          <Text
            className={`text-sm font-bold ${
              isRose ? "text-ui-aubergine" : "text-ui-forest"
            }`}
          >
            Choose this
          </Text>
          <Icon name="ArrowRight" size={16} color={iconColor} />
        </View>
      </View>
    </Pressable>
  );
}
