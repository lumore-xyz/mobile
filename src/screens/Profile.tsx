import ProfileNativeAd from "@/src/components/ads/ProfileNativeAd";
import PostCard from "@/src/components/profile/PostCard";
import ProfileEssentialsSection from "@/src/components/profile/ProfileEssentialsSection";
import ProfileCompatibilityCard from "@/src/components/profile/ProfileCompatibilityCard";
import ProfileCompletionCard from "@/src/components/profile/ProfileCompletionCard";
import ProfilePostsEmptyState from "@/src/components/profile/ProfilePostsEmptyState";
import ProfilePostsHeader from "@/src/components/profile/ProfilePostsHeader";
import ProfilePostActionSheets from "@/src/components/profile/ProfilePostActionSheets";
import ProfileQuickActions from "@/src/components/profile/ProfileQuickActions";
import ProfileSummaryCard from "@/src/components/profile/ProfileSummaryCard";
import ProfileScreenSkeleton from "@/src/components/profile/ProfileScreenSkeleton";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import ThisOrThatProfileSection from "@/src/components/profile/ThisOrThatProfileSection";
import useProfilePostActions from "@/src/hooks/profile/useProfilePostActions";
import { useUser } from "@/src/hooks/useUser";
import buildProfileTraits from "@/src/domain/profile/buildProfileTraits";
import getProfileCompletion from "@/src/domain/profile/getProfileCompletion";
import { fetchProfileCompatibility } from "@/src/features/explore/api";
import { fetchUserThisOrThatAnswers } from "@/src/features/this-or-that/api";
import { thisOrThatQueryKeys } from "@/src/features/this-or-that/queryKeys";
import { startHaloKycVerification } from "@/src/features/identity-verification/api";
import { getUser } from "@/src/service/storage";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { ThisOrThatAnswer } from "@/src/utils/types";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ScrollView,
  View,
} from "react-native";
import { useUserPosts } from "../hooks/useUserPosts";
import { useUserPrefrence } from "../hooks/useUserPrefrence";
import type { ProfilePost } from "@/src/domain/profile/types";

interface ProfileScreenProps {
  profileUserId?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profileUserId,
  isRefreshing = false,
  onRefresh,
}) => {
  const currentUser = getUser();
  const currentUserId = currentUser?._id;
  const targetUserId = profileUserId || currentUserId || "";
  const isOwner = targetUserId === currentUserId;

  const { user, isLoading: isUserLoading } = useUser(targetUserId);
  const { posts, isLoading: isPostsLoading } = useUserPosts(targetUserId);
  const { userPrefrence, isLoading: isPreferenceLoading } =
    useUserPrefrence(targetUserId);
  const {
    actionSheetOpen,
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
    editCopy,
  } = useProfilePostActions(targetUserId);
  const sharedInterests = Array.isArray(user?.interests)
    ? user.interests.filter(
        (interest: unknown): interest is string =>
          typeof interest === "string" && interest.trim().length > 0,
      )
    : [];
  const shouldBlurProfilePicture =
    !isOwner && !user?.isViewerUnlockedByUser && Boolean(user?.profilePicture);
  const [isStartingVerification, setIsStartingVerification] = useState(false);

  const { data: thisOrThatRes, isLoading: isThisOrThatLoading } = useQuery({
    queryKey: thisOrThatQueryKeys.answers(targetUserId),
    queryFn: () =>
      fetchUserThisOrThatAnswers({ userId: targetUserId, page: 1, limit: 10 }),
    enabled: !!targetUserId,
  });

  const { data: compatibility, isLoading: isCompatibilityLoading } = useQuery({
    queryKey: ["profile-compatibility", currentUserId, targetUserId],
    queryFn: () => fetchProfileCompatibility(targetUserId),
    enabled: Boolean(targetUserId && !isOwner),
  });

  const thisOrThatAnswers: ThisOrThatAnswer[] = thisOrThatRes?.data || [];

  const { horizontal: horizontalTraits, vertical: verticalTraits } = useMemo(
    () => buildProfileTraits(user),
    [user],
  );

  const { profileCompletion, preferenceCompletion } = getProfileCompletion(
    user,
    userPrefrence,
  );
  const refreshControl = onRefresh ? (
    <LumoreRefreshControl
      refreshing={isRefreshing}
      onRefresh={onRefresh}
    />
  ) : undefined;
  const renderPostSeparator = useCallback(() => <View className="h-3" />, []);
  const renderPost = useCallback(
    ({ item }: { item: ProfilePost }) => (
      <PostCard
        post={item}
        canEdit={isOwner}
        onOpenActions={openPostActions}
      />
    ),
    [isOwner, openPostActions],
  );

  const handleStartVerification = async () => {
    if (isStartingVerification || user?.isVerified) return;
    triggerSelectionHaptic();
    try {
      setIsStartingVerification(true);
      const response = await startHaloKycVerification();
      if (response?.verificationUrl) {
        await WebBrowser.openBrowserAsync(response.verificationUrl);
        return;
      }
    } catch (error) {
      console.error("Unable to start verification", error);
    } finally {
      setIsStartingVerification(false);
    }
  };

  if ((isUserLoading || isPreferenceLoading) && !user) {
    return (
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        className="w-full flex-1 bg-ui-surface-page"
        refreshControl={refreshControl}
      >
        <ProfileScreenSkeleton isOwner={isOwner} />
      </ScrollView>
    );
  }

  return (
    <View className="w-full flex-1 bg-ui-surface-page">
      <FlatList
        data={posts ?? []}
        renderItem={renderPost}
        keyExtractor={(post) => post._id}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: isOwner ? 104 : 32,
        }}
        className="w-full flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={3}
        windowSize={5}
        ItemSeparatorComponent={renderPostSeparator}
        ListEmptyComponent={
          <ProfilePostsEmptyState
            isLoading={isPostsLoading}
            isOwner={isOwner}
          />
        }
        ListHeaderComponent={
          <View className="w-full">
            <ProfileSummaryCard
              user={user}
              interests={sharedInterests}
              isOwner={isOwner}
              shouldBlurProfilePicture={shouldBlurProfilePicture}
              onEditProfile={() => {
                triggerSelectionHaptic();
                router.navigate("/(subpage)/edit-profile");
              }}
              onEditPreferences={() => {
                triggerSelectionHaptic();
                router.navigate("/(subpage)/edit-preference");
              }}
            />
            {!isOwner ? (
              <ProfileCompatibilityCard
                compatibility={compatibility}
                isLoading={isCompatibilityLoading}
              />
            ) : null}

            {isOwner ? (
              <ProfileCompletionCard
                profileCompletion={profileCompletion}
                preferenceCompletion={preferenceCompletion}
              />
            ) : null}

            {isOwner ? (
              <ProfileQuickActions
                isVerified={Boolean(user?.isVerified)}
                verificationStatus={user?.verificationStatus}
                isStartingVerification={isStartingVerification}
                onStartVerification={handleStartVerification}
              />
            ) : null}

            <ProfileEssentialsSection
              horizontalTraits={horizontalTraits}
              verticalTraits={verticalTraits}
              isOwner={isOwner}
            />

            {!isOwner ? <ProfileNativeAd /> : null}

            <ThisOrThatProfileSection
              answers={thisOrThatAnswers}
              isLoading={isThisOrThatLoading}
              isOwner={isOwner}
              onPlay={() => {
                triggerSelectionHaptic();
                router.navigate("/(subpage)/games/this-or-that");
              }}
            />

            <ProfilePostsHeader
              isOwner={isOwner}
              onCreatePost={() => {
                triggerSelectionHaptic();
                router.navigate("/create-post");
              }}
            />
          </View>
        }
        refreshControl={refreshControl}
      />
      <ProfilePostActionSheets
        actionSheetOpen={actionSheetOpen}
        editSheetOpen={editSheetOpen}
        actionError={actionError}
        editError={editError}
        editText={editText}
        editVisibility={editVisibility}
        isUpdatingPost={isUpdatingPost}
        editCopy={editCopy}
        onCloseActions={closePostActions}
        onEditPost={openEditPostSheet}
        onDeletePost={handleDeletePost}
        onCloseEdit={resetPostEditing}
        onChangeText={setEditText}
        onChangeVisibility={setEditVisibility}
        onSave={handleUpdatePost}
      />
    </View>
  );
};

export default ProfileScreen;

