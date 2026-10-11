import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text } from "react-native";

export default function CreditPill({ credits }: { credits?: number }) {
  return (
    <Pressable
      onPress={() => router.push("/(subpage)/credits")}
      accessibilityRole="button"
      accessibilityLabel="View your credits"
      className="min-h-12 flex-row items-center gap-2 rounded-full bg-ui-champagne px-4 py-3 active:opacity-85"
    >
      <Icon name="Coins" size={18} color={COLORS.ink} />
      <Text className="font-bold text-ui-ink">{credits ?? "..."}</Text>
    </Pressable>
  );
}

