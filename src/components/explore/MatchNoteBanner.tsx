import React from "react";
import { Text, View } from "react-native";

interface MatchNoteBannerProps {
  note: string;
  createdAt?: string | Date | null;
}

const formatDateChip = (value?: string | Date | null) => {
  if (!value) return "Match note";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Match note";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const MatchNoteBanner: React.FC<MatchNoteBannerProps> = ({
  note,
  createdAt,
}) => {
  const clean = String(note || "").trim();
  if (!clean) return null;

  return (
    <View className="items-center gap-2 px-2 pb-2">
      <View className="rounded-full bg-ui-highlight/5 px-3 py-1">
        <Text className="text-sm text-ui-shade/60">{formatDateChip(createdAt)}</Text>
      </View>
      <View className="w-full rounded-lg border border-ui-highlight/60 bg-ui-highlight/10 px-4 py-3">
        <Text className="text-center text-sm text-ui-highlight">{clean}</Text>
      </View>
    </View>
  );
};
