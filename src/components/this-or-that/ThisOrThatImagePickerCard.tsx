import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ThisOrThatImagePickerCardProps {
  imageUri: string | null;
  label: string;
  tone: "accent" | "highlight";
  onPick: () => void;
}

export default function ThisOrThatImagePickerCard({
  imageUri,
  label,
  tone,
  onPick,
}: ThisOrThatImagePickerCardProps) {
  const isRose = tone === "accent";
  const toneColor = isRose ? COLORS.aubergine : COLORS.forest;

  return (
    <View className="overflow-hidden rounded-[26px] border border-ui-parchment bg-ui-surface-page">
      <View className="flex-row items-center justify-between gap-3 p-4">
        <View className="flex-row items-center gap-3">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              isRose ? "bg-ui-aubergine/10" : "bg-ui-forest/10"
            }`}
          >
            <Icon name="ImagePlus" size={17} color={toneColor} />
          </View>
          <View>
            <Text className="text-base font-semibold text-ui-ink">{label}</Text>
            <Text className="mt-0.5 text-xs text-ui-slate">
              {imageUri ? "Tap to replace image" : "Required image"}
            </Text>
          </View>
        </View>
        {imageUri ? (
          <View className="rounded-full bg-ui-champagne px-3 py-1">
            <Text className="text-xs font-bold text-ui-ink">Added</Text>
          </View>
        ) : null}
      </View>

      <Pressable
        onPress={onPick}
        className="mx-4 mb-4 overflow-hidden rounded-[22px] active:opacity-85"
        accessibilityRole="button"
        accessibilityLabel={`Select ${label.toLowerCase()}`}
      >
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            className="h-48 w-full"
            contentFit="cover"
          />
        ) : (
          <View className="h-44 items-center justify-center rounded-[22px] border border-dashed border-ui-slate/40 bg-ui-paper">
            <View
              className={`h-12 w-12 items-center justify-center rounded-full ${
                isRose ? "bg-ui-aubergine/10" : "bg-ui-forest/10"
              }`}
            >
              <Icon name="Upload" size={20} color={toneColor} />
            </View>
            <Text className="mt-3 text-sm font-bold text-ui-ink">
              Tap to choose image
            </Text>
            <Text className="mt-1 text-center text-xs leading-4 text-ui-slate">
              Square or portrait photos work best.
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
