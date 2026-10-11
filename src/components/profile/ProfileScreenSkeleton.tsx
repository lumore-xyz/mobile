import SurfacePanel from "@/src/components/ui/SurfacePanel";
import PostsSectionSkeleton from "@/src/components/profile/PostsSectionSkeleton";
import Skeleton from "@/src/components/ui/Skeleton";
import React from "react";
import { View } from "react-native";

const ProfileScreenSkeleton = ({ isOwner }: { isOwner: boolean }) => (
  <View className="flex-1 w-full">
    <SurfacePanel surface="paper">
      <View className="flex-row gap-4 items-center">
        <Skeleton width={112} height={112} radius={28} />
        <View className="flex-1">
          <Skeleton width="58%" height={22} />
          <View className="flex-row gap-2 mt-3">
            <Skeleton width={50} height={14} />
            <Skeleton width={64} height={14} />
            <Skeleton width={58} height={14} />
          </View>
        </View>
      </View>
      <View className="mt-5">
        <Skeleton width={76} height={12} />
        <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
        <Skeleton width="72%" height={14} style={{ marginTop: 10 }} />
      </View>
      {isOwner ? (
        <View className="mt-4 flex-row gap-2">
          <Skeleton width="49%" height={44} radius={12} />
          <Skeleton width="49%" height={44} radius={12} />
        </View>
      ) : null}
    </SurfacePanel>

    <View className="mt-4 rounded-2xl bg-ui-paper border border-ui-ink/10 p-4">
      <Skeleton width={90} height={13} />
      <View className="flex-row flex-wrap mt-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={`snapshot-pill-${index}`}
            width={index % 2 === 0 ? 92 : 118}
            height={34}
            radius={999}
            style={{ marginRight: 8, marginBottom: 8 }}
          />
        ))}
      </View>
      <Skeleton width="100%" height={1} style={{ marginTop: 6 }} />
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={`snapshot-row-${index}`}
          className="flex-row items-center mt-4"
        >
          <Skeleton width={24} height={24} radius={999} />
          <Skeleton
            width={index % 2 ? "55%" : "70%"}
            height={14}
            style={{ marginLeft: 10 }}
          />
        </View>
      ))}
    </View>

    <View className="mt-4">
      <Skeleton width={120} height={20} />
      <PostsSectionSkeleton />
    </View>
  </View>
);

export default ProfileScreenSkeleton;
