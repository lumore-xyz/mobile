import React from "react";
import { Text, View } from "react-native";

interface EarnCreditInfoPanelProps {
  text: string;
  tone: "highlight" | "muted" | "warning";
}

export default function EarnCreditInfoPanel({
  text,
  tone,
}: EarnCreditInfoPanelProps) {
  const toneClass =
    tone === "warning"
      ? "bg-ui-champagne/20"
      : tone === "highlight"
        ? "bg-ui-forest/10"
        : "bg-ui-surface-page";

  return (
    <View className={`mt-3 rounded-2xl p-3 ${toneClass}`}>
      <Text className="text-sm font-medium leading-5 text-ui-ink">{text}</Text>
    </View>
  );
}
