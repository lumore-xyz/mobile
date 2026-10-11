import type { ProfilePost } from "@/src/domain/profile/types";
import getProfilePostEditCopy from "@/src/domain/profile/getProfilePostEditCopy";
import { deletePost, updatePost } from "@/src/features/posts/api";
import { profileQueryKeys } from "@/src/features/profile/queryKeys";
import { queryClient } from "@/src/service/query-client";
import {
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from "@/src/utils/haptics";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

const useProfilePostActions = (profileUserId?: string) => {
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ProfilePost | null>(null);
  const [actionError, setActionError] = useState("");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editVisibility, setEditVisibility] = useState("public");
  const [editError, setEditError] = useState("");
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const invalidateProfilePosts = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: profileQueryKeys.posts(profileUserId || ""),
      }),
    [profileUserId],
  );

  const openPostActions = useCallback((post: ProfilePost) => {
    setSelectedPost(post);
    setActionError("");
    setActionSheetOpen(true);
  }, []);

  const closePostActions = useCallback(() => {
    setActionSheetOpen(false);
    setActionError("");
  }, []);

  const resetPostEditing = useCallback(() => {
    setActionSheetOpen(false);
    setEditSheetOpen(false);
    setSelectedPost(null);
    setEditText("");
    setEditVisibility("public");
    setEditError("");
    setIsUpdatingPost(false);
  }, []);

  const openEditPostSheet = useCallback(() => {
    if (!selectedPost?._id) return;
    triggerSelectionHaptic();
    const text =
      selectedPost.type === "PROMPT"
        ? selectedPost.content.promptAnswer
        : selectedPost.type === "IMAGE"
          ? selectedPost.content.caption
          : selectedPost.content.text;
    setEditText(text || "");
    setEditVisibility(selectedPost.visibility || "public");
    setEditError("");
    setActionSheetOpen(false);
    setEditSheetOpen(true);
  }, [selectedPost]);

  const handleUpdatePost = useCallback(async () => {
    if (!selectedPost?._id || isUpdatingPost) return;
    const trimmedText = editText.trim();
    const copy = getProfilePostEditCopy(selectedPost);

    if (copy.required && !trimmedText) {
      setEditError("Please add something before saving.");
      return;
    }

    const content =
      selectedPost.type === "PROMPT"
        ? {
            promptId:
              typeof selectedPost.content.promptId === "object"
                ? selectedPost.content.promptId?._id
                : selectedPost.content.promptId,
            promptAnswer: trimmedText,
          }
        : selectedPost.type === "IMAGE"
          ? { ...selectedPost.content, caption: trimmedText }
          : { text: trimmedText };

    try {
      setIsUpdatingPost(true);
      setEditError("");
      await updatePost(selectedPost._id, {
        content,
        visibility: editVisibility,
      });
      await invalidateProfilePosts();
      triggerSuccessHaptic();
      resetPostEditing();
    } catch {
      setEditError("Unable to update post right now.");
    } finally {
      setIsUpdatingPost(false);
    }
  }, [editText, editVisibility, invalidateProfilePosts, isUpdatingPost, resetPostEditing, selectedPost]);

  const handleDeletePost = useCallback(() => {
    if (!selectedPost?._id) return;
    triggerSelectionHaptic();
    Alert.alert(
      "Delete post",
      "Are you sure you want to delete this post? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost(selectedPost._id);
              await invalidateProfilePosts();
              triggerSuccessHaptic();
              resetPostEditing();
            } catch {
              setActionError("Unable to delete post right now.");
            }
          },
        },
      ],
    );
  }, [invalidateProfilePosts, resetPostEditing, selectedPost]);

  return {
    actionSheetOpen,
    selectedPost,
    actionError,
    editSheetOpen,
    editText,
    editVisibility,
    editError,
    isUpdatingPost,
    openPostActions,
    closePostActions,
    resetPostEditing,
    openEditPostSheet,
    handleUpdatePost,
    handleDeletePost,
    setEditText,
    setEditVisibility,
    editCopy: getProfilePostEditCopy(selectedPost),
  };
};

export default useProfilePostActions;
