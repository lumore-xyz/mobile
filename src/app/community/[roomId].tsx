import { UserChat } from "@/src/app/chat";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import Button from "@/src/components/ui/Button";
import Skeleton from "@/src/components/ui/Skeleton";
import Tabs from "@/src/components/ui/Tabs";
import { TextAreaInput, TextInput } from "@/src/components/ui/TextInput";
import { EXPLORE_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import { useMediaPermisions } from "@/src/hooks/useMediaPermision";
import {
  fetchIbox,
  fetchLocationRoomDetail,
  followLocationRoom,
  leaveLocationRoomPool,
  rejoinLocationRoom,
  startLocationRoomMatchNow,
  unfollowLocationRoom,
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

type RoomSection = "pool" | "chats";

const RoomSectionTabs = React.memo(function RoomSectionTabs({
  activeSection,
  poolCount,
  chatCount,
  onSelect,
}: {
  activeSection: RoomSection;
  poolCount: number;
  chatCount: number;
  onSelect: (section: RoomSection) => void;
}) {
  const tabs = [
    { key: "pool", label: "Matching pool", count: poolCount },
    { key: "chats", label: "Matched chats", count: chatCount },
  ];

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeSection}
      onSelect={(key) => onSelect(key as RoomSection)}
      showBadges={true}
    />
  );
});

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
  const [activeSection, setActiveSection] = useState<RoomSection>("pool");
  const query = useQuery({
    queryKey: ["rooms", roomId],
    queryFn: () => fetchLocationRoomDetail(roomId),
    enabled: Boolean(roomId),
  });
  const { data: roomChats = [] } = useQuery<MatchRoomSummary[]>({
    queryKey: ["inbox", "location_room", roomId, "active"],
    queryFn: () =>
      fetchIbox({
        status: "active",
        source: "location_room",
        locationRoom: roomId,
      }),
    enabled: Boolean(currentUser?._id && roomId),
  });
  const room = query.data?.room;
  const userState = query.data?.userState;
  const members = query.data?.members || [];
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
    queryClient.invalidateQueries({ queryKey: ["inbox"] });
  }, [queryClient]);
  const followMutation = useMutation({
    mutationFn: () => followLocationRoom(roomId),
    onSuccess: invalidate,
  });
  const rejoinMutation = useMutation({
    mutationFn: () => rejoinLocationRoom(roomId),
    onSuccess: invalidate,
  });
  const leavePoolMutation = useMutation({
    mutationFn: () => leaveLocationRoomPool(roomId),
    onSuccess: invalidate,
  });
  const unfollowMutation = useMutation({
    mutationFn: () => unfollowLocationRoom(roomId),
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
      Alert.alert(
        "Community updated",
        "Your community details have been updated.",
      );
    },
    onError: (roomError: any) => {
      Alert.alert(
        "Could not update community",
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
        "This community does not have an address to copy.",
      );
      return;
    }

    await Clipboard.setStringAsync(valueToCopy);
    Alert.alert("Copied", valueToCopy);
  }, [mapQuery, roomAddress]);

  const handleOpenMap = useCallback(async () => {
    if (!mapQuery) {
      Alert.alert(
        "No location yet",
        "This community does not have a map location.",
      );
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

  const renderMember: ListRenderItem<LocationRoomMember> = ({ item }) => (
    <MemberCard member={item} />
  );

  const renderRoomChat = useCallback<ListRenderItem<MatchRoomSummary>>(
    ({ item: chat }) => {
      const matchedUser = (chat?.participants || []).find(
        (participant: any) => !isSameId(participant?._id, currentUser?._id),
      );
      return <UserChat room={chat} matchedUser={matchedUser} />;
    },
    [currentUser?._id],
  );

  if (query.isLoading) {
    return <RoomDetailSkeleton />;
  }

  if (!room) {
    return (
      <View className="flex-1 items-center justify-center bg-ui-light px-6">
        <Text className="text-center text-ui-shade">Community not found.</Text>
        <Button
          text="Back to community"
          className="mt-4"
          onClick={() => router.replace("/rooms" as any)}
        />
      </View>
    );
  }

  const inPool = Boolean(userState?.inPool);
  const isFollowed = Boolean(userState?.isPinned);
  const canManageRoom = Boolean(
    room && (currentUser?.isAdmin || isSameId(room.creator, currentUser?._id)),
  );
  const canLeaveRoom = Boolean(isFollowed || inPool);
  const canSaveRoomEdits =
    trimmedEditedTitle.length >= 3 &&
    trimmedEditedTitle.length <= 80 &&
    trimmedEditedDescription.length <= 500;

  const handleConfirmLeaveRoom = () => {
    const isLeavingActivePool = Boolean(inPool);
    Alert.alert(
      isLeavingActivePool ? "Exit matching pool?" : "Leave community?",
      isLeavingActivePool
        ? "You will leave this matching pool and stop following this community."
        : "You will stop following this community and leave its matching pool.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: isLeavingActivePool ? "Exit pool" : "Leave community",
          style: "destructive",
          onPress: () => {
            closeCreatorSheet();
            if (isLeavingActivePool) {
              leavePoolMutation.mutate();
            } else {
              unfollowMutation.mutate();
            }
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
              : isFollowed
                ? "You follow this community."
                : "Pin this community to join the next cycle."}
          </Text>
          {userState?.poolStatus === "matched" ? (
            <Text className="mt-1 text-sm text-ui-shade/70">
              You matched in this community. Rejoin when you want another cycle.
            </Text>
          ) : null}
          {userState?.poolStatus === "insufficient_credits" ? (
            <Text className="mt-1 text-sm text-red-500">
              Add credits, then rejoin this community.
            </Text>
          ) : null}
        </View>

        <View className="mx-5 mb-5 gap-3">
          {inPool ? (
            <Button
              text={
                leavePoolMutation.isPending
                  ? "Exiting..."
                  : "Exit matching pool"
              }
              variant="outline"
              className="rounded-2xl"
              disabled={leavePoolMutation.isPending}
              onClick={handleConfirmLeaveRoom}
            />
          ) : (
            <Button
              text={
                isFollowed
                  ? rejoinMutation.isPending
                    ? "Rejoining..."
                    : "Rejoin pool"
                  : followMutation.isPending
                    ? "Pinning..."
                    : "Pin and join pool"
              }
              className="rounded-2xl"
              disabled={followMutation.isPending || rejoinMutation.isPending}
              onClick={() =>
                isFollowed ? rejoinMutation.mutate() : followMutation.mutate()
              }
            />
          )}
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
                        Upload a fresh image to update this community&apos;s
                        cover.
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
                          Tap to upload a community cover image
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
                <TextInput
                  label="Community name"
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
                  placeholder="Who should join this community?"
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
                      : "Save community changes"
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
                        Edit community details
                      </Text>
                      <Text className="text-sm text-ui-shade/70">
                        Update the community name, description, and cover image.
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
                        Run this community&apos;s next cycle before the
                        countdown ends.
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
        <RoomSectionTabs
          activeSection={activeSection}
          poolCount={room.poolCount || 0}
          chatCount={roomChats.length}
          onSelect={setActiveSection}
        />
        {activeSection === "pool" ? (
          <View>
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
        ) : (
          <View>
            {!roomChats.length ? (
              <Text className="rounded-2xl bg-white p-4 text-center text-ui-shade">
                No matched chats yet.
              </Text>
            ) : (
              <FlatList
                data={roomChats}
                keyExtractor={(chat) => chat._id}
                renderItem={renderRoomChat}
                scrollEnabled={false}
              />
            )}
          </View>
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
