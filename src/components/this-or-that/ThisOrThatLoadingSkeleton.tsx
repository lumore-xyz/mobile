import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { View } from "react-native";

export default function ThisOrThatLoadingSkeleton() {
  return (
    <View className="mt-5 overflow-hidden rounded-[24px] bg-ui-paper">
      <View className="bg-ui-forest/10 p-5">
        <View className="flex-row items-center justify-between">
          <Skeleton width={96} height={28} radius={999} />
          <Skeleton width={58} height={12} />
        </View>
        <Skeleton width="55%" height={12} style={{ marginTop: 22 }} />
        <Skeleton width="90%" height={24} style={{ marginTop: 8 }} />
      </View>

      <View className="gap-3 p-4">
        <View className="rounded-[26px] border border-ui-parchment bg-ui-surface-page p-4">
          <Skeleton width={74} height={24} radius={999} />
          <Skeleton width="78%" height={22} style={{ marginTop: 20 }} />
          <Skeleton width={96} height={16} style={{ marginTop: 18 }} />
        </View>
        <View className="rounded-[26px] border border-ui-parchment bg-ui-surface-page p-4">
          <Skeleton width={74} height={24} radius={999} />
          <Skeleton width="74%" height={22} style={{ marginTop: 20 }} />
          <Skeleton width={96} height={16} style={{ marginTop: 18 }} />
        </View>
      </View>

      <View className="border-t border-ui-parchment/70 px-4 py-4">
        <Skeleton width="100%" height={48} radius={999} />
      </View>
    </View>
  );
}
