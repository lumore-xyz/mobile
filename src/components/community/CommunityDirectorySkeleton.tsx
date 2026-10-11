import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { View } from "react-native";

export default function CommunityDirectorySkeleton() {
  return (
    <View>
      {Array.from({ length: 4 }, (_, index) => (
        <View
          key={`room-skeleton-${index}`}
          className="mb-4 rounded-[24px] border border-ui-parchment bg-ui-paper p-4"
        >
          <Skeleton width="100%" height={130} radius={24} />
          <Skeleton width="60%" height={18} style={{ marginTop: 14 }} />
          <Skeleton width="90%" height={12} style={{ marginTop: 12 }} />
          <Skeleton width="45%" height={12} style={{ marginTop: 18 }} />
        </View>
      ))}
    </View>
  );
}
