import React from "react";
import { Text, View } from "react-native";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";

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
    <View className="items-center gap-2 px-1 pb-2">
      <View className="rounded-full bg-ui-highlight/5 px-3 py-1.5">
        <Text className="text-xs font-medium text-ui-muted">{formatDateChip(createdAt)}</Text>
      </View>
      <View className="w-full items-center rounded-[24px] bg-ui-foreground px-5 py-4">
        <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-ui-primary">
          <Icon name="Sparkles" size={18} color={COLORS.shade} />
        </View>
        <Text className="text-center text-sm font-medium leading-5 text-ui-light">{clean}</Text>
      </View>
    </View>
  );
};
