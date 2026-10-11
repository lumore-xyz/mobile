import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { ScrollView, View } from "react-native";

const ThisOrThatSectionSkeleton = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    className="mt-3"
    contentContainerStyle={{ gap: 12 }}
  >
    {Array.from({ length: 2 }).map((_, index) => (
      <View
        key={`this-or-that-skeleton-${index}`}
        className="w-56 rounded-xl border border-ui-ink/10 bg-ui-paper overflow-hidden p-3"
      >
        <Skeleton width="100%" height={112} radius={10} />
        <Skeleton width="40%" height={10} style={{ marginTop: 12 }} />
        <Skeleton width="88%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="52%" height={10} style={{ marginTop: 8 }} />
      </View>
    ))}
  </ScrollView>
);

export default ThisOrThatSectionSkeleton;
