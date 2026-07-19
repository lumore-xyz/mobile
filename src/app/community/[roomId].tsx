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
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import { calculateAge } from "@/src/utils";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
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
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

function RoomStatPill({
  icon,
  label,
  isHighlighted = false,
}: {
  icon: string;
  label: string;
  isHighlighted?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
        isHighlighted ? "bg-ui-primary" : "bg-ui-light/15"
      }`}
    >
      <Icon
        name={icon}
        size={14}
        color={isHighlighted ? COLORS.shade : COLORS.light}
      />
      <Text
        className={`text-xs font-bold ${
          isHighlighted ? "text-ui-shade" : "text-ui-light"
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function RoomDetailScreen() {
  const insets = useSafeAreaInsets();
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
    triggerSelectionHaptic();
    setEditedTitle(String(room?.title || ""));
    setEditedDescription(String(room?.description || ""));
    setEditedCoverImageUri("");
    setIsEditingRoom(true);
  }, [room?.description, room?.title]);

  const handleCancelEditing = useCallback(() => {
    triggerSelectionHaptic();
    setEditedTitle(String(room?.title || ""));
    setEditedDescription(String(room?.description || ""));
    setEditedCoverImageUri("");
    setIsEditingRoom(false);
  }, [room?.description, room?.title]);

  const closeCreatorSheet = useCallback(() => {
    triggerSelectionHaptic();
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
    <ScrollView
      className="flex-1 bg-ui-surface-page px-4 pt-6"
      contentContainerClassName="pb-10"
    >
      <View className="overflow-hidden rounded-[32px] border border-ui-border bg-ui-light">
        <ImageBackground
          source={{ uri: room.imageUrl || ROOM_COVER_IMAGE_URL }}
          resizeMode="cover"
          style={{ minHeight: 360, justifyContent: "space-between" }}
        >
          <View className="absolute inset-0 bg-black/45" />

          <View className="flex-row items-center justify-between p-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => {
                router.back();
              }}
              className="h-11 w-11 items-center justify-center rounded-full bg-ui-light/90 active:opacity-75"
            >
              <Icon name="ArrowLeft" size={22} color={COLORS.shade} />
            </Pressable>

            <View className="flex-row items-center gap-2">
              {canManageRoom ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open creator controls"
                  onPress={() => {
                    triggerSelectionHaptic();
                    setIsCreatorSheetOpen(true);
                  }}
                  className="h-11 w-11 items-center justify-center rounded-full bg-ui-light/90 active:opacity-75"
                >
                  <Icon name="Settings" size={21} color={COLORS.shade} />
                </Pressable>
              ) : null}
              {canLeaveRoom ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Leave community"
                  onPress={handleConfirmLeaveRoom}
                  className="h-11 w-11 items-center justify-center rounded-full bg-ui-light/90 active:opacity-75"
                >
                  <Icon name="LogOut" size={21} color={COLORS.danger} />
                </Pressable>
              ) : null}
            </View>
          </View>

          <View className="p-5">
            <View className="mb-4 flex-row items-center gap-2">
              <View className="rounded-full bg-ui-light/90 px-3 py-1">
                <RoomCountdown
                  nextMatchAt={room.nextMatchAt}
                  fallbackSeconds={room.secondsUntilNextMatch}
                />
              </View>
            </View>

            <Text
              className="text-4xl font-bold leading-10 text-ui-light"
              accessibilityRole="header"
            >
              {room.title}
            </Text>
            {room.description ? (
              <Text className="mt-2 text-base leading-6 text-ui-light/80">
                {room.description}
              </Text>
            ) : null}

            <View className="mt-5 flex-row flex-wrap gap-2">
              <RoomStatPill
                icon="Sparkles"
                label={`${room.poolCount || 0} in pool`}
                isHighlighted={inPool}
              />
              <RoomStatPill
                icon="Users"
                label={`${room.pinnedCount || 0} pinned`}
              />
            </View>
          </View>
        </ImageBackground>

        <View className="p-5">
          <View className="rounded-[24px] bg-ui-shade/5 p-4">
            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-highlight/10">
                <Icon name="MapPin" size={18} color={COLORS.highlight} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-ui-shade">
                  Community location
                </Text>
                <Text
                  className="mt-1 text-sm leading-5 text-ui-muted"
                  numberOfLines={2}
                >
                  {roomAddress || "Location details are not available yet."}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Copy community address"
                onPress={handleCopyAddress}
                className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-ui-light px-3 active:opacity-75"
              >
                <Icon name="Copy" size={16} color={COLORS.shade} />
                <Text className="font-semibold text-ui-shade">Copy</Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open community in map"
                onPress={handleOpenMap}
                className="min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-ui-highlight px-3 active:opacity-75"
              >
                <Icon name="Map" size={16} color={COLORS.light} />
                <Text className="font-semibold text-ui-light">Open map</Text>
              </Pressable>
            </View>
          </View>

          <View className="mt-4 rounded-[24px] bg-ui-foreground p-4">
            <View className="flex-row items-center justify-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-primary">
                <Icon
                  name={
                    inPool ? "Sparkles" : isFollowed ? "Pin" : "HeartHandshake"
                  }
                  size={18}
                  color={COLORS.shade}
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-ui-light">
                  {inPool
                    ? "You are in this matching pool."
                    : isFollowed
                      ? "You follow this community."
                      : "Pin this community to join the next cycle."}
                </Text>
                {userState?.poolStatus === "matched" ? (
                  <Text className="mt-1 text-sm leading-5 text-ui-light/70">
                    You matched in this community. Rejoin when you want another
                    cycle.
                  </Text>
                ) : null}
                {userState?.poolStatus === "insufficient_credits" ? (
                  <Text className="mt-1 text-sm leading-5 text-ui-primary">
                    Add credits, then rejoin this community.
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <View className="mt-4 gap-3">
            {inPool ? (
              <Button
                text={
                  leavePoolMutation.isPending
                    ? "Exiting..."
                    : "Exit matching pool"
                }
                variant="outline"
                className="rounded-full"
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
                className="rounded-full"
                disabled={followMutation.isPending || rejoinMutation.isPending}
                onClick={() =>
                  isFollowed ? rejoinMutation.mutate() : followMutation.mutate()
                }
              />
            )}
          </View>
        </View>
      </View>

      <Actionsheet isOpen={isCreatorSheetOpen} onClose={closeCreatorSheet}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="bg-ui-surface-page p-0">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <ScrollView
            className="w-full"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            <View className="w-full px-4 pb-3">
              <View className="flex-row items-center gap-4 rounded-[28px] bg-ui-foreground p-4">
                <Pressable
                  onPress={
                    isEditingRoom ? handleCancelEditing : closeCreatorSheet
                  }
                  className="h-11 w-11 items-center justify-center rounded-full bg-ui-light/10 active:opacity-75"
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isEditingRoom ? "Back" : "Close creator controls"
                  }
                >
                  <Icon
                    name={isEditingRoom ? "ArrowLeft" : "X"}
                    size={22}
                    className="text-ui-light"
                  />
                </Pressable>

                <View className="flex-1">
                  <Text className="text-xs font-semibold text-ui-light/60">
                    {isEditingRoom ? "Editing community" : "Creator controls"}
                  </Text>
                  <Text className="mt-1 text-2xl font-bold leading-7 text-ui-light">
                    {isEditingRoom ? room.title : "Shape this community"}
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-ui-light/70">
                    {isEditingRoom
                      ? "Keep it honest, specific, and easy to join."
                      : "Edit details or run the next cycle before the countdown ends."}
                  </Text>
                </View>

                {isEditingRoom ? (
                  <Pressable
                    onPress={() => {
                      if (canSaveRoomEdits && !updateRoomMutation.isPending) {
                        updateRoomMutation.mutate();
                      }
                    }}
                    disabled={!canSaveRoomEdits || updateRoomMutation.isPending}
                    className={`h-11 w-11 items-center justify-center rounded-full bg-ui-primary ${
                      !canSaveRoomEdits || updateRoomMutation.isPending
                        ? "opacity-40"
                        : "active:opacity-80"
                    }`}
                    hitSlop={4}
                    accessibilityRole="button"
                    accessibilityLabel="Save community changes"
                    accessibilityState={{
                      disabled:
                        !canSaveRoomEdits || updateRoomMutation.isPending,
                    }}
                  >
                    <Icon name="Check" size={22} className="text-ui-shade" />
                  </Pressable>
                ) : (
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-primary">
                    <Icon name="Sparkles" size={20} className="text-ui-shade" />
                  </View>
                )}
              </View>
            </View>

            <View className="w-full px-4 pb-4">
              {isEditingRoom ? (
                <View className="gap-3">
                  <View className="rounded-[24px] border border-ui-border bg-ui-light p-4">
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-semibold text-ui-shade">
                          Cover image
                        </Text>
                        <Text className="mt-1 text-sm leading-5 text-ui-muted">
                          Upload a fresh image to update this community&apos;s
                          cover.
                        </Text>
                      </View>
                      <Pressable
                        onPress={handlePickCoverImage}
                        className="rounded-full border border-ui-border bg-ui-light px-4 py-2 active:opacity-75"
                        hitSlop={4}
                        accessibilityRole="button"
                        accessibilityLabel="Change community cover image"
                      >
                        <Text className="font-semibold text-ui-shade">
                          {editedCoverImageUri || room.imageUrl
                            ? "Change"
                            : "Upload"}
                        </Text>
                      </Pressable>
                    </View>

                    <Pressable
                      onPress={handlePickCoverImage}
                      className="mt-4"
                      accessibilityRole="button"
                      accessibilityLabel="Upload community cover image"
                    >
                      {editedCoverImageUri || room.imageUrl ? (
                        <Image
                          source={{
                            uri: editedCoverImageUri || room.imageUrl,
                          }}
                          className="h-44 w-full overflow-hidden rounded-2xl bg-ui-background"
                          style={{ resizeMode: "cover" }}
                        />
                      ) : (
                        <View className="h-40 items-center justify-center rounded-2xl border border-dashed border-ui-border bg-ui-light px-4">
                          <Icon name="Image" size={28} color={COLORS.muted} />
                          <Text className="mt-2 text-center text-sm text-ui-muted">
                            Tap to upload a community cover image
                          </Text>
                        </View>
                      )}
                    </Pressable>
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
                    className="rounded-full"
                    disabled={!canSaveRoomEdits || updateRoomMutation.isPending}
                    onClick={() => updateRoomMutation.mutate()}
                  />
                  <Button
                    text="Cancel"
                    variant="outline"
                    className="rounded-full"
                    disabled={updateRoomMutation.isPending}
                    onClick={handleCancelEditing}
                  />
                </View>
              ) : (
                <View className="gap-3">
                  <Pressable
                    onPress={handleStartEditing}
                    className="rounded-[24px] border border-ui-border bg-ui-light p-4 active:opacity-85"
                    accessibilityRole="button"
                    accessibilityLabel="Edit community details"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-highlight/10">
                        <Icon
                          name="Pencil"
                          size={20}
                          color={COLORS.highlight}
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-ui-shade">
                          Edit community details
                        </Text>
                        <Text className="mt-1 text-sm leading-5 text-ui-muted">
                          Update the community name, description, and cover
                          image.
                        </Text>
                      </View>
                      <View className="h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ui-shade/5">
                        <Icon
                          name="ChevronRight"
                          size={18}
                          color={COLORS.shade}
                        />
                      </View>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => startMatchMutation.mutate()}
                    disabled={startMatchMutation.isPending}
                    accessibilityRole="button"
                    accessibilityLabel="Start community match now"
                    accessibilityState={{
                      disabled: startMatchMutation.isPending,
                    }}
                    className={`rounded-[24px] border border-ui-highlight/20 bg-ui-highlight/10 p-4 active:opacity-85 ${
                      startMatchMutation.isPending ? "opacity-70" : ""
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-primary">
                        <Icon name="Zap" size={20} color={COLORS.highlight} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-ui-shade">
                          {startMatchMutation.isPending
                            ? "Starting cycle..."
                            : "Start match now"}
                        </Text>
                        <Text className="mt-1 text-sm leading-5 text-ui-muted">
                          Run this community&apos;s next cycle before the
                          countdown ends.
                        </Text>
                      </View>
                      <View className="h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ui-highlight">
                        <Icon name="Zap" size={16} color={COLORS.light} />
                      </View>
                    </View>
                  </Pressable>

                  <View className="mt-1 rounded-[24px] bg-ui-shade/5 p-4">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-ui-muted">
                      What creators can do
                    </Text>
                    <View className="mt-2 gap-2">
                      <View className="flex-row items-center gap-2">
                        <Icon
                          name="BadgeCheck"
                          size={14}
                          color={COLORS.highlight}
                        />
                        <Text className="text-sm text-ui-shade">
                          Edit name, description, and cover image
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Icon
                          name="Sparkles"
                          size={14}
                          color={COLORS.highlight}
                        />
                        <Text className="text-sm text-ui-shade">
                          Run the next match cycle on demand
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </ActionsheetContent>
      </Actionsheet>

      <View className="mb-6 mt-6">
        <View className="mb-3">
          <Text className="text-xl font-bold text-ui-shade">
            Inside this community
          </Text>
          <Text className="mt-1 text-sm text-ui-muted">
            See who is waiting and the chats created from this room.
          </Text>
        </View>
        <RoomSectionTabs
          activeSection={activeSection}
          poolCount={room.poolCount || 0}
          chatCount={roomChats.length}
          onSelect={setActiveSection}
        />
        {activeSection === "pool" ? (
          <View>
            {!members.length ? (
              <CommunityEmptyPanel
                icon="Users"
                title="Nobody is in the pool yet"
                copy="Be the first to pin this room and start the next cycle."
              />
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
              <CommunityEmptyPanel
                icon="MessageCircleHeart"
                title="No matched chats yet"
                copy="Matched chats from this community will appear here after a cycle runs."
              />
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

function CommunityEmptyPanel({
  icon,
  title,
  copy,
}: {
  icon: string;
  title: string;
  copy: string;
}) {
  return (
    <View className="items-center rounded-[28px] border border-ui-border bg-ui-light px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-highlight/10">
        <Icon name={icon} size={24} color={COLORS.highlight} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-shade">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-muted">
        {copy}
      </Text>
    </View>
  );
}

function MemberCard({ member }: { member: LocationRoomMember }) {
  const displayName = member.nickname || member.username || "Lumore User";
  const detailText = [
    member.dob ? `${calculateAge(member.dob)} yrs` : null,
    member.gender,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <View className="mb-3 flex-row items-center rounded-[24px] border border-ui-border bg-ui-light p-3">
      <View className="mr-3 h-12 w-12 overflow-hidden rounded-full bg-ui-highlight/10">
        {member.profilePicture ? (
          <Image
            source={{ uri: member.profilePicture }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text className="text-xl font-bold text-ui-highlight">
              {displayName.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-bold text-ui-shade">{displayName}</Text>
        <Text className="text-sm text-ui-muted">
          {detailText || "Waiting in the pool"}
        </Text>
      </View>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-primary/30">
        <Icon name="Sparkles" size={16} color={COLORS.shade} />
      </View>
    </View>
  );
}

function RoomDetailSkeleton() {
  return (
    <View className="flex-1 bg-ui-surface-page px-4 pt-6">
      <View className="overflow-hidden rounded-[32px] bg-ui-foreground p-5">
        <Skeleton width={44} height={44} radius={9999} />
        <Skeleton width="72%" height={34} style={{ marginTop: 220 }} />
        <Skeleton width="90%" height={12} style={{ marginTop: 14 }} />
      </View>
      <View className="mt-4 rounded-[28px] border border-ui-border bg-ui-light p-5">
        <Skeleton width="70%" height={18} />
        <Skeleton width="90%" height={12} style={{ marginTop: 12 }} />
        <Skeleton width="100%" height={44} style={{ marginTop: 18 }} />
      </View>
    </View>
  );
}
