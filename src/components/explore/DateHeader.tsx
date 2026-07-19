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
    <View className="items-center py-1">
      <View className="rounded-full bg-ui-foreground px-3 py-1.5">
        <Text className="text-xs font-medium text-ui-light">{date}</Text>
      </View>
    </View>
  );
};
