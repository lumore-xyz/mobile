import Button from "@/src/components/ui/Button";
import Skeleton from "@/src/components/ui/Skeleton";
import { EXPLORE_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import {
  fetchLocationRoomDetail,
  pinLocationRoom,
  rejoinLocationRoom,
  unpinLocationRoom,
  type LocationRoomMember,
} from "@/src/libs/apis";
import Icon from "@/src/libs/Icon";
import { useSocket } from "@/src/service/context/SocketContext";
import { calculateAge } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  ListRenderItem,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ROOM_COVER_IMAGE_URL =
  "https://cdn.pixabay.com/photo/2022/11/13/12/42/building-7589141_1280.jpg";

const getCountdownSeconds = ({
  nextMatchAt,
  fallbackSeconds,
}: {
  nextMatchAt?: string | null;
  fallbackSeconds?: number;
}) => {
  if (nextMatchAt) {
    const nextMatchTime = new Date(nextMatchAt).getTime();
    if (Number.isFinite(nextMatchTime)) {
      return Math.max(0, Math.ceil((nextMatchTime - Date.now()) / 1000));
    }
  }

  return Math.max(0, Math.ceil(Number(fallbackSeconds || 0)));
};

const formatCountdown = (seconds?: number) => {
  const safeSeconds = Math.max(0, Math.floor(Number(seconds || 0)));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
};

const getRoomCoordinates = (room: any) => {
  const coordinates = room?.location?.coordinates;
  if (!Array.isArray(coordinates) || coordinates.length !== 2) return null;
  const longitude = Number(coordinates[0]);
  const latitude = Number(coordinates[1]);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
};

function RoomCountdown({
  nextMatchAt,
  fallbackSeconds,
}: {
  nextMatchAt?: string | null;
  fallbackSeconds?: number;
}) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getCountdownSeconds({ nextMatchAt, fallbackSeconds }),
  );

  useEffect(() => {
    setRemainingSeconds(getCountdownSeconds({ nextMatchAt, fallbackSeconds }));

    const intervalId = setInterval(() => {
      setRemainingSeconds(
        getCountdownSeconds({ nextMatchAt, fallbackSeconds }),
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [fallbackSeconds, nextMatchAt]);

  return (
    <Text className="font-semibold text-ui-highlight">
      {formatCountdown(remainingSeconds)}
    </Text>
  );
}

export default function RoomDetailScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { socket, revalidateSocket } = useSocket();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["rooms", roomId],
    queryFn: () => fetchLocationRoomDetail(roomId),
    enabled: Boolean(roomId),
  });
  const room = query.data?.room;
  const userState = query.data?.userState;
  const members = query.data?.members || [];
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
  }, [queryClient]);
  const pinMutation = useMutation({
    mutationFn: () => pinLocationRoom(roomId),
    onSuccess: invalidate,
  });
  const rejoinMutation = useMutation({
    mutationFn: () => rejoinLocationRoom(roomId),
    onSuccess: invalidate,
  });
  const unpinMutation = useMutation({
    mutationFn: () => unpinLocationRoom(roomId),
    onSuccess: invalidate,
  });

  useEffect(() => {
    revalidateSocket();
  }, [revalidateSocket]);

  useEffect(() => {
    if (!socket || !roomId) return;
    const onRoomUpdate = (payload?: { roomId?: string }) => {
      if (!payload?.roomId || payload.roomId === roomId) invalidate();
    };
    socket.on(EXPLORE_SOCKET_EVENTS.roomPoolUpdated, onRoomUpdate);
    socket.on(EXPLORE_SOCKET_EVENTS.roomMatchFound, onRoomUpdate);
    return () => {
      socket.off(EXPLORE_SOCKET_EVENTS.roomPoolUpdated, onRoomUpdate);
      socket.off(EXPLORE_SOCKET_EVENTS.roomMatchFound, onRoomUpdate);
    };
  }, [invalidate, roomId, socket]);

  const roomAddress = String(room?.location?.formattedAddress || "").trim();
  const roomCoordinates = getRoomCoordinates(room);
  const mapQuery = roomCoordinates
    ? `${roomCoordinates.latitude},${roomCoordinates.longitude}`
    : roomAddress;

  const handleCopyAddress = useCallback(async () => {
    const valueToCopy = roomAddress || mapQuery;
    if (!valueToCopy) {
      Alert.alert(
        "No address yet",
        "This room does not have an address to copy.",
      );
      return;
    }

    await Clipboard.setStringAsync(valueToCopy);
    Alert.alert("Copied", valueToCopy);
  }, [mapQuery, roomAddress]);

  const handleOpenMap = useCallback(async () => {
    if (!mapQuery) {
      Alert.alert("No location yet", "This room does not have a map location.");
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      mapQuery,
    )}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Unable to open map", "Please try again in a moment.");
    }
  }, [mapQuery]);

  const renderMember: ListRenderItem<LocationRoomMember> = ({ item }) => (
    <MemberCard member={item} />
  );

  if (query.isLoading) {
    return <RoomDetailSkeleton />;
  }

  if (!room) {
    return (
      <View className="flex-1 items-center justify-center bg-ui-light px-6">
        <Text className="text-center text-ui-shade">Room not found.</Text>
        <Button
          text="Back to rooms"
          className="mt-4"
          onClick={() => router.replace("/rooms" as any)}
        />
      </View>
    );
  }

  const inPool = Boolean(userState?.inPool);
  const isPinned = Boolean(userState?.isPinned);
  const matchedChatId = userState?.lastMatchRoom;

  return (
    <ScrollView className="flex-1 bg-ui-light px-4 pt-6">
      <View className="mb-5 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full bg-white"
        >
          <Icon type="Ionicons" name="arrow-back-outline" size={22} />
        </TouchableOpacity>
        <Text
          className="flex-1 text-3xl font-bold tracking-tight"
          numberOfLines={1}
        >
          {room.title}
        </Text>
      </View>

      <View className="overflow-hidden rounded-3xl border border-ui-shade/10 bg-white">
        <ImageBackground
          source={{ uri: ROOM_COVER_IMAGE_URL }}
          resizeMode="cover"
          style={{ minHeight: 260, justifyContent: "flex-end" }}
        >
          <View className="absolute inset-0 bg-black/45" />
          <View className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1">
            <RoomCountdown
              nextMatchAt={room.nextMatchAt}
              fallbackSeconds={room.secondsUntilNextMatch}
            />
          </View>

          <View className="p-5">
            <Text className="text-3xl font-bold text-white">{room.title}</Text>
            {room.description ? (
              <Text className="mt-2 text-white/80">{room.description}</Text>
            ) : null}

            <View className="mt-4 rounded-2xl bg-white/90 p-3">
              <View className="flex-row items-center gap-2">
                <Ionicons name="location-outline" size={18} color="#6D3FD1" />
                <Text
                  className="flex-1 font-semibold text-ui-dark"
                  numberOfLines={1}
                >
                  {roomAddress}
                </Text>
              </View>

              <View className="mt-3 flex-row gap-2">
                <TouchableOpacity
                  onPress={handleCopyAddress}
                  className="min-h-10 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-ui-light px-3"
                >
                  <Ionicons name="copy-outline" size={16} color="#000000" />
                  <Text className="font-semibold text-ui-dark">
                    Copy address
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleOpenMap}
                  className="min-h-10 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-ui-highlight px-3"
                >
                  <Ionicons name="map-outline" size={16} color="#FAFAFA" />
                  <Text className="font-semibold text-white">Open map</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View className="m-5 rounded-2xl bg-ui-shade/5 p-4">
          <Text className="font-semibold text-ui-dark">
            {inPool
              ? "You are in this matching pool."
              : isPinned
                ? "You follow this room."
                : "Pin this room to join the next cycle."}
          </Text>
          {userState?.poolStatus === "matched" ? (
            <Text className="mt-1 text-sm text-ui-shade/70">
              You matched in this room. Rejoin when you want another cycle.
            </Text>
          ) : null}
          {userState?.poolStatus === "insufficient_credits" ? (
            <Text className="mt-1 text-sm text-red-500">
              Add credits, then rejoin this room.
            </Text>
          ) : null}
        </View>

        <View className="mx-5 mb-5 gap-3">
          {matchedChatId ? (
            <Button
              text="Open room match chat"
              variant="secondary"
              className="rounded-2xl"
              onClick={() => router.push(`/chat/${matchedChatId}`)}
            />
          ) : null}
          {inPool ? (
            <Button
              text={unpinMutation.isPending ? "Leaving..." : "Leave room"}
              variant="outline"
              className="rounded-2xl"
              disabled={unpinMutation.isPending}
              onClick={() => unpinMutation.mutate()}
            />
          ) : (
            <Button
              text={
                isPinned
                  ? rejoinMutation.isPending
                    ? "Rejoining..."
                    : "Rejoin pool"
                  : pinMutation.isPending
                    ? "Pinning..."
                    : "Pin and join pool"
              }
              className="rounded-2xl"
              disabled={pinMutation.isPending || rejoinMutation.isPending}
              onClick={() =>
                isPinned ? rejoinMutation.mutate() : pinMutation.mutate()
              }
            />
          )}
        </View>
      </View>

      <View className="mb-6 mt-6">
        <View className="mb-3 flex-row items-center gap-2">
          <Text className="text-xl font-bold">Matching pool</Text>
          <View className="rounded-full bg-ui-highlight/10 px-2.5 py-1">
            <Text className="text-sm font-semibold text-ui-highlight">
              {room.poolCount || 0}
            </Text>
          </View>
        </View>
        {!members.length ? (
          <Text className="rounded-2xl bg-white p-4 text-center text-ui-shade">
            Nobody is in the pool yet.
          </Text>
        ) : (
          <FlatList
            data={members}
            keyExtractor={(member) => member._id}
            renderItem={renderMember}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

function MemberCard({ member }: { member: LocationRoomMember }) {
  const displayName = member.nickname || member.username || "Lumore User";
  return (
    <View className="mb-2 flex-row items-center rounded-2xl bg-white p-3">
      <View className="mr-3 h-12 w-12 overflow-hidden rounded-full bg-ui-background">
        {member.profilePicture ? (
          <Image
            source={{ uri: member.profilePicture }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text className="text-2xl text-ui-shade">
              {displayName.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-semibold">{displayName}</Text>
        <Text className="text-sm text-ui-shade/70">
          {[
            member.dob ? `${calculateAge(member.dob)} yrs` : null,
            member.gender,
          ]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      </View>
    </View>
  );
}

function RoomDetailSkeleton() {
  return (
    <View className="flex-1 bg-ui-light px-4 pt-8">
      <Skeleton width="55%" height={28} />
      <View className="mt-6 rounded-3xl bg-white p-5">
        <Skeleton width="70%" height={22} />
        <Skeleton width="90%" height={12} style={{ marginTop: 14 }} />
        <Skeleton width="100%" height={92} style={{ marginTop: 20 }} />
      </View>
    </View>
  );
}
