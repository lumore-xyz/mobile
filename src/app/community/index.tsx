import MobileNav from "@/src/components/MobileNav";
import Button from "@/src/components/ui/Button";
import Skeleton from "@/src/components/ui/Skeleton";
import { EXPLORE_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import { fetchNearbyRooms, type LocationRoomSummary } from "@/src/libs/apis";
import { useSocket } from "@/src/service/context/SocketContext";
import { useLocation } from "@/src/service/providers/LocationProvider";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  ImageBackground,
  ListRenderItem,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
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

const ROOM_COVER_IMAGE_URL =
  "https://cdn.pixabay.com/photo/2022/11/13/12/42/building-7589141_1280.jpg";

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
      <View className="flex-1 bg-ui-light px-4 pt-6">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold tracking-tight">Community</Text>
            <Text className="mt-1 text-ui-shade/70">
              Find your vibe near you.
            </Text>
          </View>
          <Button
            text="Create"
            size="sm"
            className="rounded-xl"
            onClick={() => router.push("/community/create")}
          />
        </View>

        {locationError ? (
          <View className="mb-3 rounded-2xl bg-amber-50 p-3">
            <Text className="text-sm text-amber-800">{locationError}</Text>
          </View>
        ) : null}

        {isLoading ? (
          <RoomsSkeleton />
        ) : error ? (
          <Text className="mt-10 text-center text-ui-shade">
            Unable to load communities right now.
          </Text>
        ) : !rooms.length ? (
          <EmptyRooms />
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(room) => room._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={() => {
                  void refetch();
                }}
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

function RoomCard({ room }: { room: LocationRoomSummary }) {
  const state = room.userState;
  const isPinned = Boolean(state?.isPinned);
  const inPool = Boolean(state?.inPool);
  const canRejoin = isPinned && !inPool;
  const countdown = useMemo(
    () => formatCountdown(room.secondsUntilNextMatch),
    [room.secondsUntilNextMatch],
  );

  const ctaText = inPool ? "In pool" : canRejoin ? "Rejoin" : "Pin";

  const openRoom = () => {
    triggerSelectionHaptic();
    router.push(`/community/${room._id}` as any);
  };

  return (
    <TouchableOpacity
      className="mb-3 rounded-3xl border border-ui-shade/10 bg-white active:bg-ui-shade/5 overflow-hidden"
      onPress={openRoom}
    >
      <ImageBackground
        source={{ uri: room.imageUrl || ROOM_COVER_IMAGE_URL }}
        style={{
          width: "100%",
          height: 120,
          overflow: "hidden",
        }}
        imageStyle={{ resizeMode: "cover" }}
      />
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-xl font-bold text-ui-dark">{room.title}</Text>
            {room.description ? (
              <Text className="mt-1 text-sm text-ui-shade/70" numberOfLines={2}>
                {room.description}
              </Text>
            ) : null}
          </View>
          <View className="rounded-full bg-ui-highlight/10 px-3 py-1">
            <Text className="text-sm font-semibold text-ui-highlight">
              {countdown}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap items-center gap-3">
          <RoomMeta
            icon="people-outline"
            text={`${room.poolCount || 0} in pool`}
          />
          <RoomMeta
            icon="pin-outline"
            text={`${room.pinnedCount || 0} pinned`}
          />
          {room.distanceKm != null ? (
            <RoomMeta icon="navigate-outline" text={`${room.distanceKm}km`} />
          ) : null}
        </View>

        {/* <View className="mt-4 flex-row items-center justify-between">
          <Text className="text-sm text-ui-highlight">
            {inPool
              ? "You are waiting for this cycle."
              : canRejoin
                ? "Matched before. Rejoin when ready."
                : "Pin to join the matching pool."}
          </Text>
        </View> */}
      </View>
    </TouchableOpacity>
  );
}

function RoomMeta({ icon, text }: { icon: string; text: string }) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name={icon as any} size={15} color="#565656" />
      <Text className="text-sm text-ui-shade">{text}</Text>
    </View>
  );
}

function EmptyRooms() {
  return (
    <View className="mt-16 items-center rounded-3xl border border-ui-shade/10 bg-white p-6">
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-ui-highlight/10">
        <Ionicons name="location-outline" size={28} color="#6D3FD1" />
      </View>
      <Text className="text-center text-xl font-bold">
        No communities nearby yet
      </Text>
      <Text className="mt-2 text-center text-ui-shade/70">
        Start one for your campus, cafe, event, or neighborhood.
      </Text>
      <Button
        text="Create a community"
        className="mt-5 rounded-2xl"
        onClick={() => {
          triggerSelectionHaptic();
          router.push("/community/create");
        }}
      />
    </View>
  );
}

function RoomsSkeleton() {
  return (
    <View>
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={`room-skeleton-${index}`}
          className="mb-3 rounded-3xl border border-ui-shade/10 bg-white p-4"
        >
          <Skeleton width="60%" height={18} />
          <Skeleton width="90%" height={12} style={{ marginTop: 12 }} />
          <Skeleton width="45%" height={12} style={{ marginTop: 18 }} />
        </View>
      ))}
    </View>
  );
}
