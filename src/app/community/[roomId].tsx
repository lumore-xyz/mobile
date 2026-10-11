import UserChat from "@/src/components/chat/UserChat";
import CommunityCreatorSheet from "@/src/components/community/CommunityCreatorSheet";
import CommunityContextCard from "@/src/components/community/CommunityContextCard";
import CommunityDetailHero from "@/src/components/community/CommunityDetailHero";
import CommunityEmptyPanel from "@/src/components/community/CommunityEmptyPanel";
import CommunityMembershipPanel from "@/src/components/community/CommunityMembershipPanel";
import MemberCard from "@/src/components/community/MemberCard";
import RoomDetailSkeleton from "@/src/components/community/RoomDetailSkeleton";
import RoomSectionTabs, { type RoomSection } from "@/src/components/community/RoomSectionTabs";
import Button from "@/src/components/ui/Button";
import { EXPLORE_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import useCommunityRoomActions from "@/src/features/community/useCommunityRoomActions";
import getRoomCoordinates from "@/src/features/community/getRoomCoordinates";
import type { MatchRoomSummary } from "@/src/domain/chat/inboxTypes";
import { fetchIbox } from "@/src/features/chat/api";
import { inboxQueryKeys } from "@/src/features/chat/inboxQueryKeys";
import {
  fetchLocationRoomDetail,
} from "@/src/features/community/api";
import type { LocationRoomMember } from "@/src/features/community/types";
import { communityQueryKeys } from "@/src/features/community/queryKeys";
import invalidateCommunityQueries from "@/src/features/community/invalidateCommunityQueries";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import isSameEntityId from "@/src/utils/helpers/isSameEntityId";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  type ListRenderItem,
  Text,
  View,
} from "react-native";

export default function RoomDetailScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { socket, revalidateSocket } = useSocket();
  const queryClient = useQueryClient();
  const currentUser = getUser();
  const [activeSection, setActiveSection] = useState<RoomSection>("pool");
  const query = useQuery({
    queryKey: communityQueryKeys.detail(roomId),
    queryFn: () => fetchLocationRoomDetail(roomId),
    enabled: Boolean(roomId),
  });
  const { data: roomChats = [] } = useQuery<MatchRoomSummary[]>({
    queryKey: inboxQueryKeys.locationRoomActive(roomId),
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
  const inPool = Boolean(userState?.inPool);
  const isFollowed = Boolean(userState?.isPinned);
  const invalidate = useCallback(() => {
    invalidateCommunityQueries(queryClient);
    queryClient.invalidateQueries({ queryKey: inboxQueryKeys.all });
  }, [queryClient]);
  const actions = useCommunityRoomActions({
    roomId,
    room,
    inPool,
    invalidate,
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
  const roomCoordinates = getRoomCoordinates(room?.location);
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

  const renderDetailItem = useCallback<
    ListRenderItem<LocationRoomMember | MatchRoomSummary>
  >(
    ({ item }) => {
      if (!("participants" in item)) {
        return <MemberCard member={item} />;
      }
      const matchedUser = (item.participants || []).find(
        (participant) => !isSameEntityId(participant?._id, currentUser?._id),
      );
      return <UserChat room={item} matchedUser={matchedUser} />;
    },
    [currentUser?._id],
  );

  if (query.isLoading) {
    return <RoomDetailSkeleton />;
  }

  if (!room) {
    return (
      <View className="flex-1 items-center justify-center bg-ui-paper px-6">
        <Text className="text-center text-ui-ink">Community not found.</Text>
        <Button
          text="Back to community"
          className="mt-4"
          onClick={() => router.replace("/community")}
        />
      </View>
    );
  }

  const canManageRoom = Boolean(
    room && (currentUser?.isAdmin || isSameEntityId(room.creator, currentUser?._id)),
  );
  const canLeaveRoom = Boolean(isFollowed || inPool);
  const isTopicCommunity = room.type === "topic";

  return (
    <>
      <FlatList<LocationRoomMember | MatchRoomSummary>
        data={activeSection === "pool" ? members : roomChats}
        keyExtractor={(item) => item._id}
        renderItem={renderDetailItem}
        className="flex-1 bg-ui-surface-page px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <View>
          <View className="overflow-hidden rounded-[24px] border border-ui-parchment bg-ui-paper">
            <CommunityDetailHero
              room={room}
              isInPool={inPool}
              canManageRoom={canManageRoom}
              canLeaveRoom={canLeaveRoom}
              onBack={() => router.back()}
              onOpenCreator={actions.openCreatorSheet}
              onLeave={actions.confirmLeaveRoom}
            />

            <View className="p-4">
              <CommunityContextCard
                room={room}
                roomAddress={roomAddress}
                onCopyAddress={handleCopyAddress}
                onOpenMap={handleOpenMap}
              />

              <CommunityMembershipPanel
                isInPool={inPool}
                isMember={isFollowed}
                isTopicCommunity={isTopicCommunity}
                poolStatus={userState?.poolStatus}
                isLeavingPool={actions.isLeavingPool}
                isRejoining={actions.isRejoiningRoom}
                isJoining={actions.isFollowingRoom}
                onLeave={actions.confirmLeaveRoom}
                onRejoin={actions.rejoinRoom}
                onJoin={actions.followRoom}
              />
            </View>
          </View>

          <View className="mb-6 mt-6">
            <View className="mb-3">
              <Text className="text-xl font-bold text-ui-ink">
                Inside this community
              </Text>
              <Text className="mt-1 text-sm text-ui-slate">
                {isTopicCommunity
                  ? "See who shares this interest and open chats from past matches."
                  : "See who is waiting nearby and open chats from past matches."}
              </Text>
            </View>
            <RoomSectionTabs
              activeSection={activeSection}
              poolCount={room.poolCount || 0}
              chatCount={roomChats.length}
              onSelect={setActiveSection}
            />
          </View>
          </View>
        }
        ListEmptyComponent={
          activeSection === "pool" ? (
            <CommunityEmptyPanel
              icon="Users"
              title="Nobody is in the pool yet"
              copy={
                isTopicCommunity
                  ? "Join this community’s matching pool to meet people who share these interests."
                  : "Join this community’s matching pool to meet people nearby."
              }
            />
          ) : (
            <CommunityEmptyPanel
              icon="MessageCircleHeart"
              title="No matched chats yet"
              copy="Matched chats from this community will appear here after a cycle runs."
            />
          )
        }
      />
      <CommunityCreatorSheet
        isOpen={actions.isCreatorSheetOpen}
        isEditing={actions.isEditingRoom}
        room={room}
        editedTitle={actions.editedTitle}
        setEditedTitle={actions.setEditedTitle}
        editedDescription={actions.editedDescription}
        setEditedDescription={actions.setEditedDescription}
        editedTags={actions.editedTags}
        setEditedTags={actions.setEditedTags}
        editedCoverImageUri={actions.editedCoverImageUri}
        canSave={actions.canSaveRoomEdits}
        isSaving={actions.isSavingRoom}
        isStartingMatch={actions.isStartingMatch}
        onClose={actions.closeCreatorSheet}
        onCancelEditing={actions.handleCancelEditing}
        onPickCoverImage={actions.handlePickCoverImage}
        onSave={actions.saveRoomEdits}
        onStartEditing={actions.handleStartEditing}
        onStartMatch={actions.startMatching}
      />
    </>
  );
}

