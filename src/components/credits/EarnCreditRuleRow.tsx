import React from "react";
import { Text, View } from "react-native";

export default function EarnCreditRuleRow({ text }: { text: string }) {
  return (
    <View className="flex-row items-start gap-2 rounded-2xl bg-ui-paper p-3">
      <View className="mt-1 h-2 w-2 rounded-full bg-ui-forest" />
      <Text className="flex-1 text-sm leading-5 text-ui-ink">{text}</Text>
    </View>
  );
}
