import React from "react";
import { Text, View } from "react-native";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import formatShortDate from "@/src/utils/helpers/formatShortDate";

interface MatchNoteBannerProps {
  note: string;
  createdAt?: string | Date | null;
}

export const MatchNoteBanner: React.FC<MatchNoteBannerProps> = ({
  note,
  createdAt,
}) => {
  const clean = String(note || "").trim();
  if (!clean) return null;
  const dateLabel = formatShortDate(createdAt) || "Match note";

  return (
    <View className="items-center gap-2 px-1 pb-2">
      <View className="rounded-full bg-ui-forest/5 px-3 py-1.5">
        <Text className="text-xs font-medium text-ui-slate">{dateLabel}</Text>
      </View>
      <View className="w-full items-center rounded-[24px] bg-ui-midnight px-5 py-4">
        <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-ui-champagne">
          <Icon name="Sparkles" size={18} color={COLORS.ink} />
        </View>
        <Text className="text-center text-sm font-medium leading-5 text-ui-paper">{clean}</Text>
      </View>
    </View>
  );
};
