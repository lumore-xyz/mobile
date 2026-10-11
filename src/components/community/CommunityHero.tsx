import SurfacePanel from "@/src/components/ui/SurfacePanel";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Pressable, Text, View } from "react-native";

export default function CommunityHero({
  roomCount,
  onCreate,
}: {
  roomCount: number;
  onCreate: () => void;
}) {
  return (
    <SurfacePanel surface="midnight" className="mb-5 overflow-hidden">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="font-display text-3xl text-ui-paper" accessibilityRole="header">
            Community
          </Text>
          <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
            Find people who share your interests or your corner of the city.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create a community"
          onPress={onCreate}
          className="h-11 w-11 items-center justify-center rounded-full bg-ui-champagne active:opacity-75"
        >
          <Icon name="Plus" size={22} color={COLORS.ink} />
        </Pressable>
      </View>

      <View className="mt-5 flex-row items-end justify-between gap-3">
        <View>
          <Text className="text-3xl font-bold text-ui-paper">{roomCount}</Text>
          <Text className="mt-0.5 text-sm text-ui-paper/70">
            {roomCount === 1 ? "community" : "communities"}
          </Text>
        </View>
        <View className="rounded-full bg-ui-paper/10 px-3 py-1.5">
          <Text className="text-xs font-semibold text-ui-paper">
            Local and topic communities
          </Text>
        </View>
      </View>
    </SurfacePanel>
  );
}
