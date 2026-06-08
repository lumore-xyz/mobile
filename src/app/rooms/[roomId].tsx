import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import Button from "@/src/components/ui/Button";
import Skeleton from "@/src/components/ui/Skeleton";
import { TextAreaInput, TextInput } from "@/src/components/ui/TextInput";
import { EXPLORE_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import { useMediaPermisions } from "@/src/hooks/useMediaPermision";
import {
  fetchIbox,
  fetchLocationRoomDetail,
  pinLocationRoom,
  rejoinLocationRoom,
  startLocationRoomMatchNow,
  unpinLocationRoom,
  updateLocationRoom,
  type LocationRoomMember,
  type MatchRoomSummary,
} from "@/src/libs/apis";
import Icon from "@/src/libs/Icon";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import { calculateAge } from "@/src/utils";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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

const getEntityId = (value: unknown) => {
  if (value && typeof value === "object" && "_id" in value) {
    const nestedId = (value as { _id?: unknown })._id;
    return nestedId == null ? "" : String(nestedId);
  }
  return value == null ? "" : String(value);
};

const isSameId = (first: unknown, second: unknown) => {
  const firstId = getEntityId(first);
  const secondId = getEntityId(second);
  return Boolean(firstId && secondId && firstId === secondId);
};

const buildStartMatchMessage = ({
  matchCount,
  matchedUserCount,
  skippedUserCount,
}: {
  matchCount: number;
  matchedUserCount: number;
  skippedUserCount: number;
}) => {
  if (matchCount > 0) {
    return `Started now and created ${matchCount} match${matchCount === 1 ? "" : "es"} for ${matchedUserCount} member${matchedUserCount === 1 ? "" : "s"}.`;
  }

  if (skippedUserCount > 0) {
    return `The cycle ran, but no matches were created this time. ${skippedUserCount} member${skippedUserCount === 1 ? "" : "s"} still need a compatible match or enough credits.`;
  }

  return "The cycle ran, but no matches were created this time.";
};

const getRoomChatParticipant = ({
  chat,
  currentUserId,
}: {
  chat: MatchRoomSummary;
  currentUserId?: string | null;
}) =>
  (chat.participants || []).find(
    (participant) => !isSameId(participant?._id, currentUserId),
  );

const getRoomChatLabel = ({
  chat,
  currentUserId,
}: {
  chat: MatchRoomSummary;
  currentUserId?: string | null;
}) => {
  const matchedUser = getRoomChatParticipant({ chat, currentUserId });
  const displayName =
    matchedUser?.nickname || matchedUser?.username || "Lumore User";
  return chat.status === "archive"
    ? `We lost connection with ${displayName}`
    : `Open chat with ${displayName}`;
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
  const currentUser = getUser();
  const { pickImageAsync } = useMediaPermisions();
  const [isCreatorSheetOpen, setIsCreatorSheetOpen] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedCoverImageUri, setEditedCoverImageUri] = useState("");
  const query = useQuery({
    queryKey: ["rooms", roomId],
    queryFn: () => fetchLocationRoomDetail(roomId),
    enabled: Boolean(roomId),
  });
  const { data: activeInboxRooms = [] } = useQuery<MatchRoomSummary[]>({
    queryKey: ["inbox", "active"],
    queryFn: () => fetchIbox("active"),
    enabled: Boolean(currentUser?._id),
  });
  const { data: archivedInboxRooms = [] } = useQuery<MatchRoomSummary[]>({
    queryKey: ["inbox", "archive"],
    queryFn: () => fetchIbox("archive"),
    enabled: Boolean(currentUser?._id),
  });
  const room = query.data?.room;
  const userState = query.data?.userState;
  const members = query.data?.members || [];
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
    queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
    queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
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
  const trimmedEditedTitle = editedTitle.trim();
  const trimmedEditedDescription = editedDescription.trim();
  const updateRoomMutation = useMutation({
    mutationFn: () =>
      updateLocationRoom(roomId, {
        title: trimmedEditedTitle,
        description: trimmedEditedDescription,
        imageUri: editedCoverImageUri || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setIsCreatorSheetOpen(false);
      setIsEditingRoom(false);
      setEditedCoverImageUri("");
      Alert.alert("Room updated", "Your room details have been updated.");
    },
    onError: (roomError: any) => {
      Alert.alert(
        "Could not update room",
        roomError?.response?.data?.message || "Please try again in a moment.",
      );
    },
  });
  const startMatchMutation = useMutation({
    mutationFn: () => startLocationRoomMatchNow(roomId),
    onSuccess: (result) => {
      invalidate();
      setIsCreatorSheetOpen(false);
      Alert.alert(
        "Matching started",
        buildStartMatchMessage({
          matchCount: result.matchCount,
          matchedUserCount: result.matchedUserCount,
          skippedUserCount: result.skippedUserCount,
        }),
      );
    },
    onError: (startError: any) => {
      Alert.alert(
        "Could not start matching",
        startError?.response?.data?.message || "Please try again in a moment.",
      );
    },
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

  const handleStartEditing = useCallback(() => {
    setEditedTitle(String(room?.title || ""));
    setEditedDescription(String(room?.description || ""));
    setEditedCoverImageUri("");
    setIsEditingRoom(true);
  }, [room?.description, room?.title]);

  const handleCancelEditing = useCallback(() => {
    setEditedTitle(String(room?.title || ""));
    setEditedDescription(String(room?.description || ""));
    setEditedCoverImageUri("");
    setIsEditingRoom(false);
  }, [room?.description, room?.title]);

  const closeCreatorSheet = useCallback(() => {
    setIsCreatorSheetOpen(false);
    setIsEditingRoom(false);
    setEditedCoverImageUri("");
  }, []);

  const handlePickCoverImage = useCallback(() => {
    pickImageAsync(
      (asset: any) => {
        setEditedCoverImageUri(asset.uri);
      },
      { aspect: [4, 3], quality: 0.85 },
    );
  }, [pickImageAsync]);

  const roomChats = useMemo(() => {
    if (!room?._id) return [];

    return [...activeInboxRooms, ...archivedInboxRooms].filter(
      (chat) =>
        chat?.source === "location_room" &&
        isSameId(chat?.locationRoom, room._id),
    );
  }, [activeInboxRooms, archivedInboxRooms, room?._id]);

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
  const canManageRoom = Boolean(
    room && (currentUser?.isAdmin || isSameId(room.creator, currentUser?._id)),
  );
  const canLeaveRoom = Boolean(isPinned || inPool);
  const canSaveRoomEdits =
    trimmedEditedTitle.length >= 3 &&
    trimmedEditedTitle.length <= 80 &&
    trimmedEditedDescription.length <= 500;

  const handleConfirmLeaveRoom = () => {
    Alert.alert(
      "Leave room?",
      "You will stop following this room and leave its matching pool.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Leave room",
          style: "destructive",
          onPress: () => {
            closeCreatorSheet();
            unpinMutation.mutate();
          },
        },
      ],
    );
  };

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
        {canManageRoom ? (
          <TouchableOpacity
            onPress={() => setIsCreatorSheetOpen(true)}
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Icon type="Ionicons" name="settings-outline" size={24} />
          </TouchableOpacity>
        ) : null}
        {canLeaveRoom ? (
          <TouchableOpacity
            onPress={handleConfirmLeaveRoom}
            className="h-11 w-11 items-center justify-center rounded-full bg-white"
          >
            <Icon type="Ionicons" name="exit-outline" size={24} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View className="overflow-hidden rounded-3xl border border-ui-shade/10 bg-white">
        <ImageBackground
          source={{ uri: room.imageUrl || ROOM_COVER_IMAGE_URL }}
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
          {roomChats.length ? (
            <View className="rounded-2xl bg-ui-shade/5 p-4">
              <Text className="font-semibold text-ui-dark">
                {roomChats.length === 1 ? "Room chat" : "Room chats"}
              </Text>
              <Text className="mt-1 text-sm text-ui-shade/70">
                {roomChats.length === 1
                  ? "Your authorized chat from this room is ready."
                  : `You have ${roomChats.length} chats from this room. Pick the one you want to open.`}
              </Text>
              <View className="mt-3 gap-2">
                {roomChats.map((chat) => (
                  <Button
                    key={chat._id}
                    text={getRoomChatLabel({
                      chat,
                      currentUserId: currentUser?._id,
                    })}
                    variant={chat.status === "archive" ? "outline" : "primary"}
                    className="rounded-2xl"
                    onClick={() => router.push(`/chat/${chat._id}`)}
                  />
                ))}
              </View>
            </View>
          ) : null}
          {!inPool ? (
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
          ) : null}
        </View>
      </View>

      <Actionsheet isOpen={isCreatorSheetOpen} onClose={closeCreatorSheet}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="p-0 pb-4">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View className="w-full px-4 pb-4">
            <View className="mb-3 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={
                  isEditingRoom ? handleCancelEditing : closeCreatorSheet
                }
                className="min-h-11 justify-center"
              >
                <Text className="text-ui-shade">
                  {isEditingRoom ? "Back" : "Close"}
                </Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Creator controls</Text>
              <View className="w-10" />
            </View>
            {isEditingRoom ? (
              <View className="gap-3">
                <View className="rounded-2xl border border-ui-shade/10 bg-ui-shade/5 p-4">
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="flex-1">
                      <Text className="font-semibold text-ui-dark">
                        Cover image
                      </Text>
                      <Text className="mt-1 text-sm text-ui-shade/70">
                        Upload a fresh image to update this room&apos;s cover.
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={handlePickCoverImage}
                      className="rounded-full border border-ui-shade/15 bg-white px-4 py-2"
                    >
                      <Text className="font-semibold text-ui-dark">
                        {editedCoverImageUri || room.imageUrl
                          ? "Change"
                          : "Upload"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    onPress={handlePickCoverImage}
                    className="mt-4"
                  >
                    {editedCoverImageUri || room.imageUrl ? (
                      <Image
                        source={{
                          uri: editedCoverImageUri || room.imageUrl,
                        }}
                        className="h-44 w-full rounded-2xl bg-ui-background"
                        style={{ resizeMode: "cover" }}
                      />
                    ) : (
                      <View className="h-40 items-center justify-center rounded-2xl border border-dashed border-ui-shade/20 bg-white px-4">
                        <Icon type="Ionicons" name="image-outline" size={28} />
                        <Text className="mt-2 text-center text-sm text-ui-shade/70">
                          Tap to upload a room cover image
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                <TextInput
                  label="Room name"
                  value={editedTitle}
                  action={setEditedTitle}
                  placeholder="e.g. Indiranagar Evenings"
                  autoCapitalize="words"
                  isInvalid={
                    editedTitle.length > 0 && trimmedEditedTitle.length < 3
                  }
                  errorText={
                    editedTitle.length > 0 && trimmedEditedTitle.length < 3
                      ? "Use at least 3 characters."
                      : undefined
                  }
                />
                <TextAreaInput
                  label="Description"
                  value={editedDescription}
                  action={setEditedDescription}
                  placeholder="Who should join this room?"
                  errorText={
                    trimmedEditedDescription.length > 500
                      ? "Keep it under 500 characters."
                      : undefined
                  }
                />
                <Button
                  text={
                    updateRoomMutation.isPending
                      ? "Saving..."
                      : "Save room changes"
                  }
                  className="rounded-2xl"
                  disabled={!canSaveRoomEdits || updateRoomMutation.isPending}
                  onClick={() => updateRoomMutation.mutate()}
                />
                <Button
                  text="Cancel"
                  variant="outline"
                  className="rounded-2xl"
                  disabled={updateRoomMutation.isPending}
                  onClick={handleCancelEditing}
                />
              </View>
            ) : (
              <View className="gap-2">
                <TouchableOpacity
                  onPress={handleStartEditing}
                  className="rounded-2xl border border-ui-shade/10 bg-white px-4 py-3"
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="create-outline" size={18} color="#111827" />
                    <View className="flex-1">
                      <Text className="font-semibold text-ui-dark">
                        Edit room details
                      </Text>
                      <Text className="text-sm text-ui-shade/70">
                        Update the room name, description, and cover image.
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => startMatchMutation.mutate()}
                  disabled={startMatchMutation.isPending}
                  className={`rounded-2xl border border-ui-highlight/20 bg-ui-highlight/10 px-4 py-3 ${
                    startMatchMutation.isPending ? "opacity-70" : ""
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <Ionicons name="flash-outline" size={18} color="#6D3FD1" />
                    <View className="flex-1">
                      <Text className="font-semibold text-ui-dark">
                        {startMatchMutation.isPending
                          ? "Starting cycle..."
                          : "Start match now"}
                      </Text>
                      <Text className="text-sm text-ui-shade/70">
                        Run this room&apos;s next cycle before the countdown
                        ends.
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ActionsheetContent>
      </Actionsheet>

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
