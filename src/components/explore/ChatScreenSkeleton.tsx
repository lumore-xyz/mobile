import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { View } from "react-native";

const ChatScreenSkeleton = () => (
  <View className="bg-ui-surface-page" style={{ flex: 1 }}>
    <View className="border-b border-ui-parchment bg-ui-paper px-4 py-3">
      <View className="flex-row items-center">
        <Skeleton width={40} height={40} radius={999} />
        <View className="ml-3 flex-1">
          <Skeleton width="46%" height={14} />
          <Skeleton width="28%" height={11} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>

    <View className="flex-1 px-4 py-4">
      <Skeleton width="72%" height={36} radius={16} />
      <Skeleton width="54%" height={52} radius={16} style={{ marginTop: 12 }} />
      <View className="items-end mt-3">
        <Skeleton width="64%" height={36} radius={16} />
      </View>
      <Skeleton width="58%" height={36} radius={16} style={{ marginTop: 12 }} />
      <View className="items-end mt-3">
        <Skeleton width="44%" height={36} radius={16} />
      </View>
    </View>

    <View className="border-t border-ui-parchment bg-ui-paper px-3 py-3">
      <Skeleton width="100%" height={56} radius={999} />
    </View>
  </View>
);

export default ChatScreenSkeleton;
