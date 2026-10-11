import React from "react";
import { Text, View } from "react-native";

export default function ActiveFilterChip({ label }: { label: string }) {
  return (
    <View className="rounded-full bg-ui-forest/10 px-3 py-1.5">
      <Text className="text-xs font-semibold text-ui-forest">{label}</Text>
    </View>
  );
}
