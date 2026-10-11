import SurfacePanel from "@/src/components/ui/SurfacePanel";
import React from "react";
import { Text, View } from "react-native";

const ProfileCompletionCard = ({
  profileCompletion,
  preferenceCompletion,
}: {
  profileCompletion: number;
  preferenceCompletion: number;
}) => (
  <SurfacePanel surface="midnight" className="mt-5">
    <View className="flex-row items-start justify-between gap-4">
      <View className="flex-1">
        <Text
          className="text-xl font-bold text-ui-paper"
          accessibilityRole="header"
        >
          Make your profile magnetic
        </Text>
        <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
          Complete a few more details to help better matches find you.
        </Text>
      </View>
      <View className="h-11 min-w-14 items-center justify-center rounded-full bg-ui-champagne px-3">
        <Text className="font-bold text-ui-ink">{profileCompletion}%</Text>
      </View>
    </View>
    <Text className="mt-5 text-sm font-medium text-ui-paper">
      Profile details
    </Text>
    <View className="mt-2 h-2.5 w-full rounded-full bg-ui-paper/15">
      <View
        className="h-2.5 rounded-full bg-ui-champagne"
        style={{ width: `${profileCompletion}%` }}
      />
    </View>
    <View className="mt-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-medium text-ui-paper">
          Match preferences
        </Text>
        <Text className="text-sm font-semibold text-ui-paper">
          {preferenceCompletion}%
        </Text>
      </View>
      <View className="mt-2 h-2.5 w-full rounded-full bg-ui-paper/15">
        <View
          className="h-2.5 rounded-full bg-ui-aubergine"
          style={{ width: `${preferenceCompletion}%` }}
        />
      </View>
    </View>
  </SurfacePanel>
);

export default ProfileCompletionCard;
