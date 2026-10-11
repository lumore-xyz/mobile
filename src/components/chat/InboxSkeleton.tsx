import InboxItemSkeleton from "@/src/components/chat/InboxItemSkeleton";
import React from "react";
import { View } from "react-native";

const InboxSkeleton = () => (
  <View className="mt-1 gap-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <InboxItemSkeleton key={`chat-skeleton-${index}`} />
    ))}
  </View>
);

export default InboxSkeleton;
