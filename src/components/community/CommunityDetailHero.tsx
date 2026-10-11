import CommunityCoverImage from "@/src/components/community/CommunityCoverImage";
import RoomCountdown from "@/src/components/community/RoomCountdown";
import RoomStatPill from "@/src/components/community/RoomStatPill";
import type { LocationRoomSummary } from "@/src/features/community/types";
import formatCommunityTag from "@/src/features/community/formatCommunityTag";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface CommunityDetailHeroProps {
  room: LocationRoomSummary;
  isInPool: boolean;
  canManageRoom: boolean;
  canLeaveRoom: boolean;
  onBack: () => void;
  onOpenCreator: () => void;
  onLeave: () => void;
}

const CommunityDetailHero = ({
  room,
  isInPool,
  canManageRoom,
  canLeaveRoom,
  onBack,
  onOpenCreator,
  onLeave,
}: CommunityDetailHeroProps) => {
  const isTopicCommunity = room.type === "topic";

  return (
    <View className="relative justify-between overflow-hidden" style={{ minHeight: 320 }}>
      <CommunityCoverImage
        uri={room.imageUrl}
        className="absolute inset-0 h-full w-full"
        style={StyleSheet.absoluteFillObject}
      />
      <View className="absolute inset-0 bg-ui-ink/45" />

      <View className="flex-row items-center justify-between p-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          className="h-11 w-11 items-center justify-center rounded-full bg-ui-paper/90 active:opacity-75"
        >
          <Icon name="ArrowLeft" size={22} color={COLORS.ink} />
        </Pressable>

        <View className="flex-row items-center gap-2">
          {canManageRoom ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open creator controls"
              onPress={onOpenCreator}
              className="h-11 w-11 items-center justify-center rounded-full bg-ui-paper/90 active:opacity-75"
            >
              <Icon name="Settings" size={21} color={COLORS.ink} />
            </Pressable>
          ) : null}
          {canLeaveRoom ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Leave community"
              onPress={onLeave}
              className="h-11 w-11 items-center justify-center rounded-full bg-ui-paper/90 active:opacity-75"
            >
              <Icon name="LogOut" size={21} color={COLORS.danger} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View className="p-4">
        <View className="mb-4 flex-row items-center gap-2">
          <View className="rounded-full bg-ui-paper/90 px-3 py-1">
            <RoomCountdown
              nextMatchAt={room.nextMatchAt}
              fallbackSeconds={room.secondsUntilNextMatch}
            />
          </View>
        </View>

        <Text
          className="text-3xl font-bold leading-9 text-ui-paper"
          accessibilityRole="header"
          numberOfLines={3}
        >
          {room.title}
        </Text>
        {room.description ? (
          <Text className="mt-2 text-base leading-6 text-ui-paper/80">
            {room.description}
          </Text>
        ) : null}
        {!isTopicCommunity && room.tags?.length ? (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {room.tags.map((tag) => (
              <View key={tag} className="rounded-full bg-ui-paper/15 px-3 py-1.5">
                <Text className="text-xs font-semibold text-ui-paper">
                  {formatCommunityTag(tag)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <View className="mt-5 flex-row flex-wrap gap-2">
          <RoomStatPill
            icon={isTopicCommunity ? "Sparkles" : "MapPin"}
            label={isTopicCommunity ? "Topic community" : "Local community"}
          />
          <RoomStatPill
            icon="Sparkles"
            label={`${room.poolCount || 0} in pool`}
            isHighlighted={isInPool}
          />
          <RoomStatPill
            icon="Users"
            label={`${room.pinnedCount || 0} members`}
          />
        </View>
      </View>
    </View>
  );
};

export default CommunityDetailHero;
