import MobileNav from "@/src/components/MobileNav";
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
  ImageBackground,
  ImageSourcePropType,
  ListRenderItem,
  Platform,
  Pressable,
  RefreshControl,
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

const COMMUNITY_COVER_IMAGE_URL =
  "https://cdn.pixabay.com/photo/2022/11/13/12/42/building-7589141_1280.jpg";

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
          <View className="mb-4 flex-row items-start gap-3 rounded-[24px] border border-ui-border bg-ui-primary/20 p-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-light">
              <Icon name="MapPinOff" size={18} color={COLORS.shade} />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-ui-shade">Location needs a nudge</Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">{locationError}</Text>
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
                tintColor={COLORS.highlight}
                colors={[COLORS.highlight]}
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
    <View className="mb-5 overflow-hidden rounded-[28px] bg-ui-foreground p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-3xl font-bold text-ui-light" accessibilityRole="header">
            Community
          </Text>
          <Text className="mt-1 text-sm leading-5 text-ui-light/70">
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
          className="h-11 w-11 items-center justify-center rounded-full bg-ui-primary active:opacity-75"
        >
          <Icon name="Plus" size={22} color={COLORS.shade} />
        </Pressable>
      </View>

      <View className="mt-5 flex-row items-end justify-between gap-3">
        <View>
          <Text className="text-3xl font-bold text-ui-light">{roomCount}</Text>
          <Text className="mt-0.5 text-sm text-ui-light/70">
            {roomCount === 1 ? "nearby room" : "nearby rooms"}
          </Text>
        </View>
        <View className="rounded-full bg-ui-light/10 px-3 py-1.5">
          <Text className="text-xs font-semibold text-ui-light">
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
  const imageSource: ImageSourcePropType = {
    uri: room.imageUrl || COMMUNITY_COVER_IMAGE_URL,
  };
  const countdown = useMemo(
    () => formatCountdown(room.secondsUntilNextMatch),
    [room.secondsUntilNextMatch],
  );

  const openRoom = () => {
    triggerSelectionHaptic();
    router.push(`/community/${room._id}` as any);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${room.title} community`}
      className="mb-4 overflow-hidden rounded-[28px] border border-ui-border bg-ui-light active:opacity-90"
      onPress={openRoom}
    >
      <ImageBackground
        source={imageSource}
        style={{
          width: "100%",
          height: 148,
          overflow: "hidden",
          justifyContent: "space-between",
        }}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View className="absolute inset-0 bg-black/30" />
        <View className="flex-row items-start justify-between p-3">
          <View className="rounded-full bg-ui-light/90 px-3 py-1">
            <Text className="text-xs font-bold text-ui-foreground">
              {countdown}
            </Text>
          </View>
          {inPool || canRejoin || isPinned ? (
            <View className="rounded-full bg-ui-primary px-3 py-1">
              <Text className="text-xs font-bold text-ui-shade">
                {inPool ? "In pool" : canRejoin ? "Rejoin ready" : "Pinned"}
              </Text>
            </View>
          ) : null}
        </View>
      </ImageBackground>
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-ui-shade" numberOfLines={1}>
              {room.title}
            </Text>
            {room.description ? (
              <Text
                className="mt-1 text-sm leading-5 text-ui-muted"
                numberOfLines={2}
              >
                {room.description}
              </Text>
            ) : null}
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-highlight/10">
            <Icon name="ChevronRight" size={20} color={COLORS.highlight} />
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap items-center gap-2">
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

        <View className="mt-4 rounded-2xl bg-ui-highlight/5 px-4 py-3">
          <Text className="text-sm font-medium text-ui-highlight">
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
        isHighlighted ? "bg-ui-primary/30" : "bg-ui-shade/5"
      }`}
    >
      <Icon
        name={icon}
        size={14}
        color={isHighlighted ? COLORS.shade : COLORS.muted}
      />
      <Text
        className={`max-w-[210px] text-xs font-semibold ${
          isHighlighted ? "text-ui-shade" : "text-ui-muted"
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
    <View className="mt-1 items-center rounded-[28px] border border-ui-border bg-ui-light px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-highlight/10">
        <Icon name="MapPin" size={24} color={COLORS.highlight} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-shade">
        No communities nearby yet
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-muted">
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
      className="mt-1 items-center rounded-[28px] border border-ui-border bg-ui-light px-6 py-8"
      accessibilityLiveRegion="polite"
    >
      <View className="h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <Icon name="CloudOff" size={24} color={COLORS.danger} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-shade">
        Communities are taking a moment
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-muted">
        We could not load nearby rooms. Check your connection and try again.
      </Text>
      <Button text="Try again" onClick={onRetry} className="mt-5 px-6" />
    </View>
  );
}

function RoomsSkeleton() {
  return (
    <View>
      <View className="mb-4 overflow-hidden rounded-[28px] bg-ui-foreground p-5">
        <Skeleton width="65%" height={28} />
        <Skeleton width="92%" height={12} style={{ marginTop: 12 }} />
        <Skeleton width="48%" height={12} style={{ marginTop: 8 }} />
      </View>
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={`room-skeleton-${index}`}
          className="mb-4 rounded-[28px] border border-ui-border bg-ui-light p-4"
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
