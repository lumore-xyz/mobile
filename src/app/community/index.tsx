import MobileNav from "@/src/components/MobileNav";
import CommunityCoverImage from "@/src/components/community/CommunityCoverImage";
import Button from "@/src/components/ui/Button";
import Skeleton from "@/src/components/ui/Skeleton";
import { EXPLORE_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import { fetchNearbyRooms, type LocationRoomSummary } from "@/src/libs/apis";
import { useSocket } from "@/src/service/context/SocketContext";
import { useLocation } from "@/src/service/providers/LocationProvider";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

const formatCountdown = (seconds?: number) => {
  const safeSeconds = Math.max(0, Number(seconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

const useTick = () => {
  const [tick, setTick] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  return tick;
};

export default function RoomsScreen() {
  const { latitude, longitude, error: locationError } = useLocation();
  const { socket, revalidateSocket } = useSocket();
  const queryClient = useQueryClient();
  useTick();

  const {
    data: rooms = [],
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["rooms", "nearby", latitude, longitude],
    queryFn: () => fetchNearbyRooms({ latitude, longitude, radiusKm: 25 }),
  });

  useEffect(() => {
    revalidateSocket();
  }, [revalidateSocket]);

  useEffect(() => {
    if (!socket) return;
    const invalidateRooms = () => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
    };
    socket.on(EXPLORE_SOCKET_EVENTS.roomPoolUpdated, invalidateRooms);
    socket.on(EXPLORE_SOCKET_EVENTS.roomMatchFound, invalidateRooms);
    return () => {
      socket.off(EXPLORE_SOCKET_EVENTS.roomPoolUpdated, invalidateRooms);
      socket.off(EXPLORE_SOCKET_EVENTS.roomMatchFound, invalidateRooms);
    };
  }, [queryClient, socket]);

  const renderItem = useCallback<ListRenderItem<LocationRoomSummary>>(
    ({ item }) => <RoomCard room={item} />,
    [],
  );

  return (
    <>
      <View className="flex-1 bg-ui-surface-page px-4 pt-6">
        <CommunityHero roomCount={rooms.length} />

        {locationError ? (
          <View className="mb-4 flex-row items-start gap-3 rounded-[24px] border border-ui-parchment bg-ui-champagne/20 p-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-paper">
              <Icon name="MapPinOff" size={18} color={COLORS.ink} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-ui-ink">Location needs a nudge</Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">{locationError}</Text>
            </View>
          </View>
        ) : null}

        {isLoading ? (
          <RoomsSkeleton />
        ) : error ? (
          <RoomsError onRetry={() => void refetch()} />
        ) : !rooms.length ? (
          <EmptyRooms />
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(room) => room._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => {
                  void refetch();
                }}
                tintColor={COLORS.forest}
                colors={[COLORS.forest]}
              />
            }
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            removeClippedSubviews={Platform.OS === "android"}
          />
        )}
      </View>
      <MobileNav />
    </>
  );
}

function CommunityHero({ roomCount }: { roomCount: number }) {
  return (
    <View className="mb-5 overflow-hidden rounded-[24px] bg-ui-midnight p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="font-display text-3xl text-ui-paper" accessibilityRole="header">
            Community
          </Text>
          <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
            Local rooms for campus corners, cafe evenings, events, and nearby sparks.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Create a community"
          onPress={() => {
            triggerSelectionHaptic();
            router.push("/community/create");
          }}
          className="h-11 w-11 items-center justify-center rounded-full bg-ui-champagne active:opacity-75"
        >
          <Icon name="Plus" size={22} color={COLORS.ink} />
        </Pressable>
      </View>

      <View className="mt-5 flex-row items-end justify-between gap-3">
        <View>
          <Text className="text-3xl font-bold text-ui-paper">{roomCount}</Text>
          <Text className="mt-0.5 text-sm text-ui-paper/70">
            {roomCount === 1 ? "nearby room" : "nearby rooms"}
          </Text>
        </View>
        <View className="rounded-full bg-ui-paper/10 px-3 py-1.5">
          <Text className="text-xs font-semibold text-ui-paper">
            25km radius
          </Text>
        </View>
      </View>
    </View>
  );
}

function RoomCard({ room }: { room: LocationRoomSummary }) {
  const state = room.userState;
  const isPinned = Boolean(state?.isPinned);
  const inPool = Boolean(state?.inPool);
  const canRejoin = isPinned && !inPool;
  const poolCount = Number(room.poolCount || 0);
  const pinnedCount = Number(room.pinnedCount || 0);
  const locationLabel = String(room.location?.formattedAddress || "Nearby").trim();
  const distanceLabel =
    typeof room.distanceKm === "number" && Number.isFinite(room.distanceKm)
      ? `${room.distanceKm.toFixed(room.distanceKm < 10 ? 1 : 0)}km away`
      : "Near you";
  const countdown = useMemo(
    () => formatCountdown(room.secondsUntilNextMatch),
    [room.secondsUntilNextMatch],
  );

  const openRoom = () => {
    triggerSelectionHaptic();
    router.push(`/community/${room._id}`);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${room.title} community`}
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
            <Text className="text-xs font-bold text-ui-midnight">
              {countdown}
            </Text>
          </View>
          {inPool || canRejoin || isPinned ? (
            <View className="rounded-full bg-ui-champagne px-3 py-1">
              <Text className="text-xs font-bold text-ui-ink">
                {inPool ? "In pool" : canRejoin ? "Rejoin ready" : "Pinned"}
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
              <Text
                className="mt-1 text-sm leading-5 text-ui-slate"
                numberOfLines={2}
              >
                {room.description}
              </Text>
            ) : null}
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
            <Icon name="ChevronRight" size={20} color={COLORS.forest} />
          </View>
        </View>

        <View className="mt-3 flex-row flex-wrap items-center gap-2">
          <RoomMeta
            icon="Sparkles"
            text={`${poolCount} in pool`}
            isHighlighted={poolCount > 0}
          />
          <RoomMeta
            icon="Users"
            text={`${pinnedCount} pinned`}
          />
          <RoomMeta
            icon="MapPin"
            text={locationLabel}
          />
          <RoomMeta icon="Navigation" text={distanceLabel} />
        </View>

        <View className="mt-3 rounded-2xl bg-ui-forest/5 px-3 py-2.5">
          <Text className="text-sm font-medium text-ui-forest">
            {inPool
              ? "You are waiting for this cycle."
              : canRejoin
                ? "Matched before. Rejoin when ready."
                : "Pin to join the matching pool."}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function RoomMeta({
  icon,
  text,
  isHighlighted = false,
}: {
  icon: string;
  text: string;
  isHighlighted?: boolean;
}) {
  return (
    <View
      className={`max-w-full flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
        isHighlighted ? "bg-ui-champagne/30" : "bg-ui-ink/5"
      }`}
    >
      <Icon
        name={icon}
        size={14}
        color={isHighlighted ? COLORS.ink : COLORS.slate}
      />
      <Text
        className={`max-w-[210px] text-xs font-semibold ${
          isHighlighted ? "text-ui-ink" : "text-ui-slate"
        }`}
        numberOfLines={1}
      >
        {text}
      </Text>
    </View>
  );
}

function EmptyRooms() {
  return (
    <View className="mt-1 items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon name="MapPin" size={24} color={COLORS.forest} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-ink">
        No communities nearby yet
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
        Start one for your campus, cafe, event, or neighborhood.
      </Text>
      <Button
        text="Create a community"
        className="mt-5 px-6"
        onClick={() => {
          triggerSelectionHaptic();
          router.push("/community/create");
        }}
      />
    </View>
  );
}

function RoomsError({ onRetry }: { onRetry: () => void }) {
  return (
    <View
      className="mt-1 items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8"
      accessibilityLiveRegion="polite"
    >
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-danger/5">
        <Icon name="CloudOff" size={24} color={COLORS.danger} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-ink">
        Communities are taking a moment
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
        We could not load nearby rooms. Check your connection and try again.
      </Text>
      <Button text="Try again" onClick={onRetry} className="mt-5 px-6" />
    </View>
  );
}

function RoomsSkeleton() {
  return (
    <View>
      <View className="mb-4 overflow-hidden rounded-[24px] bg-ui-midnight p-5">
        <Skeleton width="65%" height={28} />
        <Skeleton width="92%" height={12} style={{ marginTop: 12 }} />
        <Skeleton width="48%" height={12} style={{ marginTop: 8 }} />
      </View>
      {Array.from({ length: 4 }).map((_, index) => (
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
