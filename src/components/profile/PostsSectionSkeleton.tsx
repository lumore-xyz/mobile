import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { View } from "react-native";

const PostsSectionSkeleton = () => (
  <View className="gap-3 mt-2">
    {Array.from({ length: 3 }).map((_, index) => (
      <View
        key={`post-skeleton-${index}`}
        className="border border-ui-ink/10 rounded-2xl bg-ui-paper p-4"
      >
        <Skeleton width={index % 2 ? "74%" : "62%"} height={13} />
        <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
        <Skeleton width="82%" height={14} style={{ marginTop: 9 }} />
        <Skeleton width="44%" height={14} style={{ marginTop: 9 }} />
      </View>
    ))}
  </View>
);

export default PostsSectionSkeleton;
