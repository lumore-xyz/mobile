import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { View } from "react-native";

const CreditHistorySkeleton = () => (
  <View className="gap-3">
    {Array.from({ length: 4 }).map((_, index) => (
      <View
        key={`credit-history-skeleton-${index}`}
        className="flex-row items-center justify-between rounded-[22px] bg-ui-paper p-4"
      >
        <View className="flex-1 pr-4">
          <Skeleton width="58%" height={13} />
          <Skeleton width="44%" height={11} style={{ marginTop: 8 }} />
        </View>
        <View className="items-end">
          <Skeleton width={46} height={13} />
          <Skeleton width={66} height={11} style={{ marginTop: 8 }} />
        </View>
      </View>
    ))}
  </View>
);

export default CreditHistorySkeleton;
