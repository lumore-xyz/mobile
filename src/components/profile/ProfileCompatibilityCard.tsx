import SurfacePanel from "@/src/components/ui/SurfacePanel";
import type { ProfileCompatibility } from "@/src/features/explore/api";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

const ProfileCompatibilityCard = ({
  compatibility,
  isLoading,
}: {
  compatibility?: ProfileCompatibility;
  isLoading: boolean;
}) => (
  <SurfacePanel surface="paper" className="mt-5 flex-row items-center justify-between gap-4">
    <View className="flex-1 flex-row items-center gap-3">
      <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-champagne">
        <Icon name="Sparkles" size={20} color={COLORS.ink} />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-ui-ink">Profile compatibility</Text>
        <Text className="mt-0.5 text-xs leading-4 text-ui-slate">
          Freshly calculated from your preferences and this profile.
        </Text>
      </View>
    </View>
    <View className="min-w-20 items-center rounded-2xl bg-ui-champagne px-3 py-2">
      {isLoading ? (
        <ActivityIndicator size="small" color={COLORS.ink} />
      ) : compatibility ? (
        <>
          <Text className="text-xl font-semibold text-ui-ink">
            {Math.round(compatibility.score)}
          </Text>
          <Text className="text-xs font-semibold text-ui-ink">/ 100</Text>
        </>
      ) : (
        <Text className="text-xs font-semibold text-ui-slate">Unavailable</Text>
      )}
    </View>
  </SurfacePanel>
);

export default ProfileCompatibilityCard;
