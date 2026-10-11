import Icon from "@/src/libs/Icon";
import Skeleton from "@/src/components/ui/Skeleton";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

interface ReferralStatCardProps {
  label: string;
  icon: string;
  value: number;
  isLoading?: boolean;
}

export default function ReferralStatCard({
  label,
  icon,
  value,
  isLoading,
}: ReferralStatCardProps) {
  return (
    <View className="flex-1 items-center rounded-[22px] bg-ui-surface-page p-3">
      <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon name={icon} size={16} color={COLORS.forest} />
      </View>
      <Text className="text-xs font-semibold text-ui-slate">{label}</Text>
      {isLoading ? (
        <Skeleton width={36} height={24} style={{ marginTop: 6 }} />
      ) : (
        <Text className="mt-1 text-xl font-semibold text-ui-ink">{value}</Text>
      )}
    </View>
  );
}
