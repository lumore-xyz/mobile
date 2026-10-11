import { useMediaPermisions } from "@/src/hooks/useMediaPermision";
import buildStartMatchMessage from "@/src/features/community/buildStartMatchMessage";
import {
  followLocationRoom,
  leaveLocationRoomPool,
  rejoinLocationRoom,
  startLocationRoomMatchNow,
  unfollowLocationRoom,
  updateLocationRoom,
} from "@/src/features/community/api";
import type { LocationRoomSummary } from "@/src/features/community/types";
import showErrorAlert from "@/src/utils/showErrorAlert";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

const useCommunityRoomActions = ({
  roomId,
  room,
  inPool,
  invalidate,
}: {
  roomId: string;
  room?: LocationRoomSummary;
  inPool: boolean;
  invalidate: () => void;
}) => {
  const { pickImageAsync } = useMediaPermisions();
  const [isCreatorSheetOpen, setIsCreatorSheetOpen] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [editedCoverImageUri, setEditedCoverImageUri] = useState("");
  const trimmedEditedTitle = editedTitle.trim();
  const trimmedEditedDescription = editedDescription.trim();
  const canSaveRoomEdits =
    trimmedEditedTitle.length >= 3 &&
    trimmedEditedTitle.length <= 80 &&
    trimmedEditedDescription.length <= 500;

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
  const updateRoomMutation = useMutation({
    mutationFn: () =>
      updateLocationRoom(roomId, {
        title: trimmedEditedTitle,
        description: trimmedEditedDescription,
        tags: editedTags,
        imageUri: editedCoverImageUri || undefined,
      }),
    onSuccess: () => {
      invalidate();
      setIsCreatorSheetOpen(false);
      setIsEditingRoom(false);
      setEditedCoverImageUri("");
      Alert.alert("Community updated", "Your community details have been updated.");
    },
    onError: (error: unknown) => {
      showErrorAlert("Could not update community", error);
    },
  });
  const startMatchMutation = useMutation({
    mutationFn: () => startLocationRoomMatchNow(roomId),
    onSuccess: (result) => {
      invalidate();
      setIsCreatorSheetOpen(false);
      Alert.alert("Matching started", buildStartMatchMessage(result));
    },
    onError: (error: unknown) => {
      showErrorAlert("Could not start matching", error);
    },
  });
  const { mutate: follow, isPending: isFollowingRoom } = followMutation;
  const { mutate: rejoin, isPending: isRejoiningRoom } = rejoinMutation;
  const { mutate: leavePool, isPending: isLeavingPool } = leavePoolMutation;
  const { mutate: unfollow } = unfollowMutation;
  const { mutate: saveRoom, isPending: isSavingRoom } = updateRoomMutation;
  const { mutate: startMatch, isPending: isStartingMatch } = startMatchMutation;

  const openCreatorSheet = useCallback(() => {
    triggerSelectionHaptic();
    setIsCreatorSheetOpen(true);
  }, []);
  const resetRoomDraft = useCallback(() => {
    setEditedTitle(String(room?.title || ""));
    setEditedDescription(String(room?.description || ""));
    setEditedTags(room?.tags || []);
    setEditedCoverImageUri("");
  }, [room?.description, room?.tags, room?.title]);
  const closeCreatorSheet = useCallback(() => {
    triggerSelectionHaptic();
    setIsCreatorSheetOpen(false);
    setIsEditingRoom(false);
    setEditedCoverImageUri("");
  }, []);
  const handleStartEditing = useCallback(() => {
    triggerSelectionHaptic();
    resetRoomDraft();
    setIsEditingRoom(true);
  }, [resetRoomDraft]);
  const handleCancelEditing = useCallback(() => {
    triggerSelectionHaptic();
    resetRoomDraft();
    setIsEditingRoom(false);
  }, [resetRoomDraft]);
  const handlePickCoverImage = useCallback(() => {
    pickImageAsync((asset) => setEditedCoverImageUri(asset.uri), {
      aspect: [4, 3],
      quality: 0.85,
    });
  }, [pickImageAsync]);
  const saveRoomEdits = useCallback(() => {
    if (canSaveRoomEdits && !isSavingRoom) saveRoom();
  }, [canSaveRoomEdits, isSavingRoom, saveRoom]);
  const startMatching = useCallback(
    () => startMatch(),
    [startMatch],
  );
  const followRoom = useCallback(() => follow(), [follow]);
  const rejoinRoom = useCallback(() => rejoin(), [rejoin]);
  const confirmLeaveRoom = useCallback(() => {
    const isLeavingActivePool = inPool;
    Alert.alert(
      isLeavingActivePool ? "Exit matching pool?" : "Leave community?",
      isLeavingActivePool
        ? "You will leave this matching pool and stop following this community."
        : "You will stop following this community and leave its matching pool.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isLeavingActivePool ? "Exit pool" : "Leave community",
          style: "destructive",
          onPress: () => {
            closeCreatorSheet();
            if (isLeavingActivePool) leavePool();
            else unfollow();
          },
        },
      ],
    );
  }, [closeCreatorSheet, inPool, leavePool, unfollow]);

  return {
    isCreatorSheetOpen,
    isEditingRoom,
    editedTitle,
    editedDescription,
    editedTags,
    editedCoverImageUri,
    setEditedTitle,
    setEditedDescription,
    setEditedTags,
    canSaveRoomEdits,
    isSavingRoom,
    isStartingMatch,
    isFollowingRoom,
    isRejoiningRoom,
    isLeavingPool,
    followRoom,
    rejoinRoom,
    openCreatorSheet,
    closeCreatorSheet,
    handleStartEditing,
    handleCancelEditing,
    handlePickCoverImage,
    saveRoomEdits,
    startMatching,
    confirmLeaveRoom,
  };
};

export default useCommunityRoomActions;
