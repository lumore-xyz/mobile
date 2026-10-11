import SurfacePanel from "@/src/components/ui/SurfacePanel";
import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { View } from "react-native";

export default function NotificationLoadingSkeleton() {
  return (
    <View>
      <View className="px-4 pb-5 pt-3">
        <SurfacePanel surface="midnight" className="overflow-hidden">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Skeleton width="72%" height={24} />
              <Skeleton width="92%" height={12} style={{ marginTop: 10 }} />
              <Skeleton width="70%" height={12} style={{ marginTop: 8 }} />
            </View>
            <Skeleton width={44} height={44} radius={9999} />
          </View>
          <Skeleton width={56} height={30} style={{ marginTop: 20 }} />
          <Skeleton width="42%" height={12} style={{ marginTop: 8 }} />
        </SurfacePanel>
      </View>
      <View className="gap-3 px-4">
        {Array.from({ length: 5 }, (_, index) => (
          <View key={index} className="flex-row gap-3 rounded-[24px] border border-ui-parchment bg-ui-paper p-4">
            <Skeleton width={40} height={40} radius={9999} />
            <View className="flex-1 gap-2">
              <Skeleton width="55%" height={14} />
              <Skeleton width="100%" height={12} />
              <Skeleton width="80%" height={12} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
