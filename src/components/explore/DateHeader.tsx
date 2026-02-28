import React from "react";
import { Text, View } from "react-native";

interface DateHeaderProps {
  timestamp: number;
}

export const DateHeader: React.FC<DateHeaderProps> = ({ timestamp }) => {
  const date = new Date(timestamp).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View className="items-center">
      <View className="bg-ui-highlight/5 px-3 py-1 rounded-full">
        <Text className="text-sm text-ui-shade/60">{date}</Text>
      </View>
    </View>
  );
};
