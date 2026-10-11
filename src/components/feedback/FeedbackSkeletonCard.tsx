import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { View } from "react-native";

const FeedbackSkeletonCard = () => (
  <View className="rounded-[24px] border border-ui-parchment bg-ui-paper p-4">
    <View className="flex-row items-center justify-between gap-2">
      <Skeleton width="38%" height={12} />
      <Skeleton width={76} height={10} />
    </View>
    <Skeleton width={64} height={10} style={{ marginTop: 10 }} />
    <Skeleton width="100%" height={12} style={{ marginTop: 10 }} />
    <Skeleton width="76%" height={12} style={{ marginTop: 8 }} />
  </View>
);

export default FeedbackSkeletonCard;
