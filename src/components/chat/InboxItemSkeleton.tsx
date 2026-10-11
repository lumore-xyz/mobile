import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { View } from "react-native";

const InboxItemSkeleton = () => (
  <View className="rounded-[24px] border border-ui-parchment bg-ui-paper px-3 py-3">
    <View className="flex-row items-center">
      <Skeleton width={56} height={56} radius={20} />
      <View className="flex-1 ml-4">
        <Skeleton width="55%" height={14} />
        <Skeleton width="82%" height={12} style={{ marginTop: 10 }} />
      </View>
      <View className="items-end ml-3">
        <Skeleton width={58} height={11} />
        <Skeleton
          width={24}
          height={24}
          radius={999}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  </View>
);

export default InboxItemSkeleton;
