import SurfacePanel from "@/src/components/ui/SurfacePanel";
import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { View } from "react-native";

export default function RoomDetailSkeleton() {
  return (
    <View className="flex-1 bg-ui-surface-page px-4 pt-6">
      <SurfacePanel surface="midnight" className="overflow-hidden">
        <Skeleton width={44} height={44} radius={9999} />
        <Skeleton width="72%" height={34} style={{ marginTop: 220 }} />
        <Skeleton width="90%" height={12} style={{ marginTop: 14 }} />
      </SurfacePanel>
      <SurfacePanel surface="paper" className="mt-4">
        <Skeleton width="70%" height={18} />
        <Skeleton width="90%" height={12} style={{ marginTop: 12 }} />
        <Skeleton width="100%" height={44} style={{ marginTop: 18 }} />
      </SurfacePanel>
    </View>
  );
}
