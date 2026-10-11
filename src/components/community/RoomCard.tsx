import CommunityCoverImage from "@/src/components/community/CommunityCoverImage";
import RoomMeta from "@/src/components/community/RoomMeta";
import RoomCountdown from "@/src/components/community/RoomCountdown";
import type { LocationRoomSummary } from "@/src/features/community/types";
import formatCommunityTag from "@/src/features/community/formatCommunityTag";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const RoomCard = React.memo(function RoomCard({
  room,
}: {
  room: LocationRoomSummary;
}) {
  const state = room.userState;
  const isPinned = Boolean(state?.isPinned);
  const inPool = Boolean(state?.inPool);
  const canRejoin = isPinned && !inPool;
  const poolCount = Number(room.poolCount || 0);
  const pinnedCount = Number(room.pinnedCount || 0);
  const isTopicCommunity = room.type === "topic";
  const locationLabel = String(room.location?.formattedAddress || "Nearby").trim();
  const distanceLabel =
    typeof room.distanceKm === "number" && Number.isFinite(room.distanceKm)
      ? `${room.distanceKm.toFixed(room.distanceKm < 10 ? 1 : 0)}km away`
      : "Near you";

  const openRoom = () => {
    triggerSelectionHaptic();
    router.push(`/community/${room._id}`);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${room.title} ${isTopicCommunity ? "topic" : "local"} community`}
      className="mb-4 overflow-hidden rounded-[24px] border border-ui-parchment bg-ui-paper active:opacity-90"
      onPress={openRoom}
    >
      <View className="relative h-[148px] w-full justify-between overflow-hidden">
        <CommunityCoverImage
          uri={room.imageUrl}
          className="absolute inset-0 h-full w-full"
          style={StyleSheet.absoluteFillObject}
        />
        <View className="absolute inset-0 bg-ui-ink/30" />
        <View className="flex-row items-start justify-between p-3">
          <View className="rounded-full bg-ui-paper/90 px-3 py-1">
            <RoomCountdown
              nextMatchAt={room.nextMatchAt}
              fallbackSeconds={room.secondsUntilNextMatch}
              precision="minutes"
              className="text-xs font-bold text-ui-midnight"
            />
          </View>
          {inPool || canRejoin || isPinned ? (
            <View className="rounded-full bg-ui-champagne px-3 py-1">
              <Text className="text-xs font-bold text-ui-ink">
                {inPool ? "In pool" : canRejoin ? "Rejoin ready" : "Joined"}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      <View className="p-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-ui-ink" numberOfLines={1}>
              {room.title}
            </Text>
            {room.description ? (
              <Text className="mt-1 text-sm leading-5 text-ui-slate" numberOfLines={2}>
                {room.description}
              </Text>
            ) : null}
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
            <Icon name="ChevronRight" size={20} color={COLORS.forest} />
          </View>
        </View>

        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          <RoomMeta icon={isTopicCommunity ? "Sparkles" : "MapPin"} text={isTopicCommunity ? "Interest-based" : "Local"} />
          <RoomMeta icon="Sparkles" text={`${poolCount} in pool`} isHighlighted={poolCount > 0} />
          <RoomMeta icon="Users" text={`${pinnedCount} members`} />
          {!isTopicCommunity && room.location?.formattedAddress ? (
            <RoomMeta icon="MapPin" text={locationLabel} />
          ) : null}
          {!isTopicCommunity && room.location ? (
            <RoomMeta icon="Navigation" text={distanceLabel} />
          ) : null}
        </View>

        {room.tags?.length ? (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {room.tags.slice(0, 4).map((tag) => (
              <View key={tag} className="rounded-full bg-ui-forest/10 px-3 py-1.5">
                <Text className="text-xs font-semibold text-ui-forest">
                  {formatCommunityTag(tag)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-3 rounded-2xl bg-ui-forest/5 px-3 py-2.5">
          <Text className="text-sm font-medium text-ui-forest">
            {inPool
              ? "You are waiting for this cycle."
              : canRejoin
                ? "You are a member. Rejoin the pool when you’re ready."
                : isTopicCommunity
                  ? "Join this community to meet people who share your interests."
                  : "Join this local community’s matching pool to meet people nearby."}
          </Text>
        </View>
      </View>
    </Pressable>
  );
});

export default RoomCard;
