import ProfileNativeAd from "@/src/components/ads/ProfileNativeAd";
import VisibilityToggle from "@/src/components/VisibilityToggle";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import Skeleton from "@/src/components/ui/Skeleton";
import { TextAreaInput } from "@/src/components/ui/TextInput";
import { useUser } from "@/src/hooks/useUser";
import {
  deletePost,
  fetchUserThisOrThatAnswers,
  startDiditVerification,
  updatePost,
} from "@/src/libs/apis";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { extractFullAddressParts } from "@/src/service/providers/LocationProvider";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";
import { calculateAge, convertHeight, distanceDisplay } from "@/src/utils";
import {
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from "@/src/utils/haptics";
import { languageDisplay } from "@/src/utils/helpers/languageDisplay";
import { ThisOrThatAnswer } from "@/src/utils/types";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useUserPosts } from "../hooks/useUserPosts";
import { useUserPrefrence } from "../hooks/useUserPrefrence";

interface ProfileScreenProps {
  profileUserId?: string;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const hasDisplayValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profileUserId,
  isRefreshing = false,
  onRefresh,
}) => {
  const currentUser = getUser();
  const currentUserId = currentUser?._id;
  const targetUserId = profileUserId || currentUserId;
  const isOwner = targetUserId === currentUserId;

  const { user, isLoading: isUserLoading } = useUser(targetUserId) as any;
  const { posts, isLoading: isPostsLoading } = useUserPosts(targetUserId);
  const { userPrefrence, isLoading: isPreferenceLoading } =
    useUserPrefrence(targetUserId);
  const shouldBlurProfilePicture =
    !isOwner && !user?.isViewerUnlockedByUser && Boolean(user?.profilePicture);
  const scrollRef = useRef<ScrollView>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [actionError, setActionError] = useState("");
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editVisibility, setEditVisibility] = useState("public");
  const [editError, setEditError] = useState("");
  const [isUpdatingPost, setIsUpdatingPost] = useState(false);
  const [isStartingVerification, setIsStartingVerification] = useState(false);

  const { data: thisOrThatRes, isLoading: isThisOrThatLoading } = useQuery({
    queryKey: ["this-or-that", "answers", targetUserId],
    queryFn: () =>
      fetchUserThisOrThatAnswers({ userId: targetUserId, page: 1, limit: 10 }),
    enabled: !!targetUserId,
  });

  const thisOrThatAnswers: ThisOrThatAnswer[] = thisOrThatRes?.data || [];

  const traitsHr = [
    user?.dob && {
      icon: "CakeSlice",
      value: calculateAge(user.dob),
    },
    user?.gender && {
      icon: "UserRound",
      value: user.gender,
    },
    user?.orientation && {
      icon: "Magnet",
      value: user.orientation,
    },
    user?.height && {
      icon: "Ruler",
      value: convertHeight(user.height),
    },
    user?.location?.formattedAddress && {
      icon: "MapPin",
      value: extractFullAddressParts(user.location.formattedAddress, [
        "district",
      ]).district,
    },
    user?.diet && {
      icon: "Utensils",
      value: user.diet,
    },
    user?.zodiacSign && {
      icon: "Sparkles",
      value: user.zodiacSign,
    },
    user?.lifestyle?.drinking && {
      icon: "Beer",
      value: user.lifestyle.drinking,
    },
    user?.lifestyle?.smoking && {
      icon: "Cigarette",
      value: user.lifestyle.smoking,
    },
    user?.lifestyle?.pets && {
      icon: "PawPrint",
      value: user.lifestyle.pets,
    },
    user?.bloodGroup && {
      icon: "Droplet",
      value: user.bloodGroup,
    },
  ].filter((trait) => trait && hasDisplayValue(trait.value));

  const traitsVr = [
    user?.work && {
      icon: "Briefcase",
      type: "lucide",
      size: 24,
      value: user.work,
    },
    user?.institution && {
      icon: "graduation.png",
      type: "image",
      size: 24,
      value: user?.institution,
    },
    user?.religion && {
      icon: "Book",
      type: "lucide",
      size: 24,
      value: user?.religion,
    },
    user?.maritalStatus && {
      icon: "relationship.png",
      type: "image",
      size: 24,
      value: user.maritalStatus,
    },
    (user?.homeTown || user?.hometown) && {
      icon: "MapPin",
      type: "lucide",
      size: 24,
      value: user?.homeTown || user?.hometown,
    },
    user?.languages?.length && {
      icon: "Languages",
      type: "lucide",
      size: 24,
      value: languageDisplay(user.languages || [])?.join(", "),
    },
    user?.personalityType && {
      icon: "mask.png",
      type: "image",
      size: 24,
      value: user?.personalityType,
    },
  ].filter((trait) => trait && hasDisplayValue(trait.value));

  const { profileCompletion, preferenceCompletion } = useMemo(() => {
    const profileFields = [
      user?.profilePicture,
      user?.bio,
      user?.gender,
      user?.dob,
      user?.interests?.length ? user?.interests : null,
      user?.height,
      user?.diet,
      user?.zodiacSign,
      user?.lifestyle?.drinking,
      user?.lifestyle?.smoking,
      user?.lifestyle?.pets,
      user?.work,
      user?.institution,
      user?.languages?.length ? user?.languages : null,
      user?.personalityType,
      user?.religion,
      user?.hometown,
    ];

    const profileFilled = profileFields.filter((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    }).length;

    const profilePercent = profileFields.length
      ? Math.round((profileFilled / profileFields.length) * 100)
      : 0;

    const preferenceFields = [
      userPrefrence?.interestedIn,
      userPrefrence?.ageRange?.length ? userPrefrence.ageRange : null,
      userPrefrence?.distance,
      userPrefrence?.heightRange?.length ? userPrefrence.heightRange : null,
      userPrefrence?.goal,
      userPrefrence?.relationshipType,
      userPrefrence?.interests?.length ? userPrefrence.interests : null,
      userPrefrence?.languages?.length ? userPrefrence.languages : null,
      userPrefrence?.zodiacPreference?.length
        ? userPrefrence.zodiacPreference
        : null,
      userPrefrence?.personalityTypePreference?.length
        ? userPrefrence.personalityTypePreference
        : null,
      userPrefrence?.dietPreference?.length
        ? userPrefrence.dietPreference
        : null,
      userPrefrence?.religionPreference?.length
        ? userPrefrence.religionPreference
        : null,
      userPrefrence?.drinkingPreference?.length
        ? userPrefrence.drinkingPreference
        : null,
      userPrefrence?.smokingPreference?.length
        ? userPrefrence.smokingPreference
        : null,
      userPrefrence?.petPreference?.length ? userPrefrence.petPreference : null,
    ];

    const preferenceFilled = preferenceFields.filter((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    }).length;

    const preferencePercent = preferenceFields.length
      ? Math.round((preferenceFilled / preferenceFields.length) * 100)
      : 0;

    return {
      profileCompletion: profilePercent,
      preferenceCompletion: preferencePercent,
    };
  }, [user, userPrefrence]);

  const openPostActions = (post: any) => {
    setSelectedPost(post);
    setActionError("");
    setActionSheetOpen(true);
  };

  const closePostActions = () => {
    setActionSheetOpen(false);
    setActionError("");
  };

  const resetPostEditing = () => {
    setActionSheetOpen(false);
    setEditSheetOpen(false);
    setSelectedPost(null);
    setEditText("");
    setEditVisibility("public");
    setEditError("");
    setIsUpdatingPost(false);
  };

  const getEditablePostText = (post: any) => {
    if (post?.type === "PROMPT") return post?.content?.promptAnswer || "";
    if (post?.type === "IMAGE") return post?.content?.caption || "";
    return post?.content?.text || "";
  };

  const openEditPostSheet = () => {
    if (!selectedPost?._id) return;
    triggerSelectionHaptic();
    setEditText(getEditablePostText(selectedPost));
    setEditVisibility(selectedPost?.visibility || "public");
    setEditError("");
    setActionSheetOpen(false);
    setEditSheetOpen(true);
  };

  const getEditPostCopy = () => {
    if (selectedPost?.type === "PROMPT") {
      return {
        title: "Edit prompt answer",
        label: "Your answer",
        placeholder: "Write an answer that feels easy to reply to.",
        helper: selectedPost?.content?.promptId?.text || undefined,
        required: true,
      };
    }

    if (selectedPost?.type === "IMAGE") {
      return {
        title: "Edit photo caption",
        label: "Caption",
        placeholder: "Add a caption that gives people something to ask about.",
        helper: "You can update the caption and visibility from here.",
        required: false,
      };
    }

    return {
      title: "Edit text post",
      label: "Post text",
      placeholder: "Share a thought, moment, or conversation starter.",
      helper: "Keep it personal and easy to respond to.",
      required: true,
    };
  };

  const handleUpdatePost = async () => {
    if (!selectedPost?._id || isUpdatingPost) return;
    const trimmedText = editText.trim();
    const copy = getEditPostCopy();

    if (copy.required && !trimmedText) {
      setEditError("Please add something before saving.");
      return;
    }

    const content =
      selectedPost?.type === "PROMPT"
        ? {
            promptId:
              selectedPost?.content?.promptId?._id ||
              selectedPost?.content?.promptId,
            promptAnswer: trimmedText,
          }
        : selectedPost?.type === "IMAGE"
          ? {
              ...selectedPost?.content,
              caption: trimmedText,
            }
          : {
              text: trimmedText,
            };

    try {
      setIsUpdatingPost(true);
      setEditError("");
      await updatePost(selectedPost._id, {
        content,
        visibility: editVisibility,
      });
      await queryClient.invalidateQueries({
        queryKey: ["user posts", targetUserId],
      });
      triggerSuccessHaptic();
      resetPostEditing();
    } catch {
      setEditError("Unable to update post right now.");
    } finally {
      setIsUpdatingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost?._id) return;
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
              await queryClient.invalidateQueries({
                queryKey: ["user posts", targetUserId],
              });
              triggerSuccessHaptic();
              resetPostEditing();
            } catch {
              setActionError("Unable to delete post right now.");
            }
          },
        },
      ],
    );
  };

  const handleStartVerification = async () => {
    if (isStartingVerification || user?.isVerified) return;
    triggerSelectionHaptic();
    try {
      setIsStartingVerification(true);
      const response = await startDiditVerification();
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
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        className="w-full flex-1 bg-ui-surface-page"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.highlight}
              colors={[COLORS.highlight]}
            />
          ) : undefined
        }
      >
        <ProfileScreenSkeleton isOwner={isOwner} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={{ padding: 16, paddingBottom: isOwner ? 104 : 32 }}
      className="w-full flex-1 bg-ui-surface-page"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.highlight}
            colors={[COLORS.highlight]}
          />
        ) : undefined
      }
    >
      <View className="flex-1 w-full">
        <View className="overflow-hidden rounded-[32px] border border-ui-border bg-ui-light p-5">
          <View className="flex-row items-center gap-5">
            <View className="h-28 w-28 shrink-0 overflow-hidden rounded-[28px] bg-ui-background">
              <Image
                source={{
                  uri: user?.profilePicture
                    ? user?.profilePicture
                    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                }}
                blurRadius={shouldBlurProfilePicture ? 12 : 0}
                accessible
                accessibilityLabel={
                  shouldBlurProfilePicture
                    ? "Profile photo hidden until unlocked"
                    : `Profile photo of ${user?.nickname || user?.username || "user"}`
                }
                style={{
                  resizeMode: "cover",
                  width: "100%",
                  height: "100%",
                }}
              />
            </View>
            <View className="flex-1">
              <Text
                className="text-[28px] font-bold leading-8 text-ui-shade"
                accessibilityRole="header"
              >
                {user?.isViewerUnlockedByUser &&
                user?.realName &&
                user.nickname ? (
                  <>
                    <Text>{user.realName}</Text>
                    <Text className="text-base font-medium text-ui-muted">
                      {"\n"}@{user.nickname}
                    </Text>
                  </>
                ) : (
                  <Text>
                    {user?.nickname ? user?.nickname : user?.username}
                  </Text>
                )}{" "}
                {user?.isVerified ? (
                  <Icon
                    name="BadgeCheck"
                    size={16}
                    color={COLORS.highlight}
                    className="flex-shrink-0"
                  />
                ) : isOwner ? (
                  <Icon
                    name="BadgeAlert"
                    size={16}
                    className="flex-shrink-0 text-ui-muted"
                  />
                ) : null}
              </Text>
              <View className="mt-3 flex-row flex-wrap items-center gap-2">
                {user?.dob ? (
                  <View className="flex-row items-center gap-1 rounded-full bg-ui-highlight/5 px-2.5 py-1.5">
                    <Icon
                      name="CakeSlice"
                      size={16}
                      className="flex-shrink-0"
                    />
                    <Text className="text-sm font-medium">
                      {calculateAge(user.dob)}
                    </Text>
                  </View>
                ) : null}

                {user?.gender ? (
                  <View className="flex-row items-center gap-1 rounded-full bg-ui-highlight/5 px-2.5 py-1.5">
                    <Icon name="UserRound" size={16} />
                    <Text className="text-sm font-medium capitalize">
                      {user.gender}
                    </Text>
                  </View>
                ) : null}

                {user?.distance != null ? (
                  <View className="flex-row items-center gap-1 rounded-full bg-ui-highlight/5 px-2.5 py-1.5">
                    <Icon
                      name="Footprints"
                      size={16}
                      className="flex-shrink-0"
                    />
                    <Text className="text-sm font-medium">
                      {distanceDisplay(user.distance)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          <View className="mt-6 border-t border-ui-border pt-5">
            <Text className="text-sm font-semibold text-ui-muted">
              {isOwner ? "About you" : "About"}
            </Text>
            <Text className="mt-2 text-base leading-6 text-ui-shade">
              {user?.bio ? user?.bio : "No bio added yet."}
            </Text>
          </View>

          {isOwner ? (
            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => {
                  triggerSelectionHaptic();
                  router.navigate("/(subpage)/edit-profile");
                }}
                className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-ui-highlight px-4 active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel="Edit profile details"
              >
                <Icon name="Pencil" size={16} color={COLORS.light} />
                <Text className="font-semibold text-ui-light">
                  Edit profile
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  triggerSelectionHaptic();
                  router.navigate("/(subpage)/edit-preference");
                }}
                className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-ui-highlight/30 px-4 active:bg-ui-highlight/5"
                accessibilityRole="button"
                accessibilityLabel="Edit match preferences"
              >
                <Icon
                  name="SlidersHorizontal"
                  size={16}
                  color={COLORS.highlight}
                />
                <Text className="font-semibold text-ui-highlight">
                  Preferences
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {isOwner ? (
          <View className="mt-5 rounded-[28px] bg-ui-foreground p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text
                  className="text-xl font-bold text-ui-light"
                  accessibilityRole="header"
                >
                  Make your profile magnetic
                </Text>
                <Text className="mt-1 text-sm leading-5 text-ui-light/70">
                  Complete a few more details to help better matches find you.
                </Text>
              </View>
              <View className="h-11 min-w-14 items-center justify-center rounded-full bg-ui-primary px-3">
                <Text className="font-bold text-ui-shade">
                  {profileCompletion}%
                </Text>
              </View>
            </View>
            <Text className="mt-5 text-sm font-medium text-ui-light">
              Profile details
            </Text>
            <View className="mt-2 h-2.5 w-full rounded-full bg-ui-light/15">
              <View
                className="h-2.5 rounded-full bg-ui-primary"
                style={{ width: `${profileCompletion}%` }}
              />
            </View>
            <View className="mt-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-ui-light">
                  Match preferences
                </Text>
                <Text className="text-sm font-semibold text-ui-light">
                  {preferenceCompletion}%
                </Text>
              </View>
              <View className="mt-2 h-2.5 w-full rounded-full bg-ui-light/15">
                <View
                  className="h-2.5 rounded-full bg-ui-accent"
                  style={{ width: `${preferenceCompletion}%` }}
                />
              </View>
            </View>
          </View>
        ) : null}

        {isOwner ? (
          <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-light p-5">
            <SectionHeading
              title="Your space"
              subtitle="Shortcuts for everything around your profile"
            />
            <View className="mt-3 flex-row flex-wrap gap-2">
              <ActionPill
                label="Credits"
                icon="Wallet"
                onPress={() => router.navigate("/(subpage)/credits")}
              />
              <ActionPill
                label="Referral"
                icon="Gift"
                onPress={() => router.navigate("/(subpage)/referral")}
              />
              <ActionPill
                label="Games"
                icon="Gamepad2"
                onPress={() => router.navigate("/(subpage)/games")}
              />
              <ActionPill
                label="Feedback"
                icon="MessageCircleMore"
                onPress={() => router.navigate("/(subpage)/feedback")}
              />
              <ActionPill
                label="Settings"
                icon="Settings"
                onPress={() => router.navigate("/(subpage)/settings")}
              />
              <ActionPill
                label="Notifications"
                icon="Bell"
                onPress={() => router.navigate("/(subpage)/notifications")}
              />
            </View>
            {!user?.isVerified ? (
              <Pressable
                onPress={handleStartVerification}
                disabled={
                  isStartingVerification ||
                  user?.verificationStatus === "pending"
                }
                className={`mt-4 min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-ui-highlight/30 bg-ui-highlight/10 px-4 py-3 active:opacity-80 ${
                  isStartingVerification ||
                  user?.verificationStatus === "pending"
                    ? "opacity-70"
                    : ""
                }`}
                accessibilityRole="button"
                accessibilityLabel="Start identity verification"
                accessibilityState={{
                  disabled:
                    isStartingVerification ||
                    user?.verificationStatus === "pending",
                }}
              >
                <Icon name="BadgeCheck" size={18} color={COLORS.highlight} />
                <Text className="font-semibold text-ui-highlight">
                  {user?.verificationStatus === "pending"
                    ? "Verification pending"
                    : isStartingVerification
                      ? "Opening verification..."
                      : "Verify myself"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <View className="mt-5 w-full rounded-[28px] border border-ui-border bg-ui-light p-5">
          <SectionHeading
            title="The essentials"
            subtitle="A quick glimpse at personality and lifestyle"
          />
          <View className="flex-row flex-wrap">
            {traitsHr.map((trait, index) => (
              <View
                key={index}
                className="mb-2 mr-2 flex-row items-center gap-2 rounded-full bg-ui-highlight/5 px-3 py-2.5"
              >
                <Icon name={trait!.icon} size={16} className="" />
                <Text className="text-sm">{trait!.value}</Text>
              </View>
            ))}
          </View>
          {traitsHr.length || traitsVr.length ? (
            <>
              {traitsVr.length ? (
                <View className="mt-3 h-px w-full bg-ui-border" />
              ) : null}
              <View>
                {traitsVr.map((trait, index) => (
                  <InfoItemVerticle
                    key={index}
                    icon={trait!.icon}
                    type={trait!.type}
                    value={trait?.value}
                  />
                ))}
              </View>
            </>
          ) : (
            <View className="mt-3 rounded-2xl bg-ui-highlight/5 p-4">
              <Text className="text-sm leading-5 text-ui-muted">
                {isOwner
                  ? "Add profile details to build your snapshot."
                  : "No public details yet."}
              </Text>
            </View>
          )}
        </View>

        {!isOwner ? <ProfileNativeAd /> : null}

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-light p-5">
          <View className="flex-row items-center justify-between">
            <SectionHeading
              title="This or That"
              subtitle="Choices that reveal a little more"
            />
            {isOwner ? (
              <Pressable
                onPress={() => {
                  triggerSelectionHaptic();
                  router.navigate("/(subpage)/games/this-or-that");
                }}
                className="min-h-11 justify-center rounded-full bg-ui-highlight/10 px-4 active:opacity-75"
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Play This or That"
              >
                <Text className="text-sm font-semibold text-ui-highlight">
                  Play
                </Text>
              </Pressable>
            ) : null}
          </View>
          {isThisOrThatLoading ? (
            <ThisOrThatSectionSkeleton />
          ) : thisOrThatAnswers.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3"
              contentContainerStyle={{ gap: 12 }}
            >
              {thisOrThatAnswers.map((answer) => (
                <View
                  key={answer._id}
                  className="w-64 overflow-hidden rounded-3xl bg-ui-highlight/5"
                >
                  {answer.selectedImageUrl ? (
                    <Image
                      source={{ uri: answer.selectedImageUrl }}
                      className="h-28 w-full"
                      style={{ resizeMode: "cover" }}
                    />
                  ) : null}
                  <View className="p-3">
                    <Text className="text-xs font-medium capitalize text-ui-muted">
                      {answer.question?.category || "general"}
                    </Text>
                    <Text className="text-sm font-semibold mt-1">
                      {answer.selectedText}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="mt-4 rounded-2xl bg-ui-highlight/5 p-4">
              <Text className="text-sm text-ui-muted">
                No answers yet. A few quick choices can make your profile feel
                more personal.
              </Text>
            </View>
          )}
        </View>

        <View className="mt-6">
          <View className="mb-3 flex-row items-center justify-between">
            <SectionHeading
              title={isOwner ? "Your posts" : "Posts"}
              subtitle="Stories, thoughts, and moments"
            />
            {isOwner ? (
              <Pressable
                onPress={() => {
                  triggerSelectionHaptic();
                  router.navigate("/create-post");
                }}
                className="min-h-11 justify-center rounded-full bg-ui-highlight/10 px-4 active:opacity-75"
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Create a new post"
              >
                <Text className="text-sm font-semibold text-ui-highlight">
                  Create
                </Text>
              </Pressable>
            ) : null}
          </View>
          {isPostsLoading ? (
            <PostsSectionSkeleton />
          ) : posts?.length ? (
            <View className="gap-3">
              {posts.map((post: any) => (
                <PostCard
                  key={post._id}
                  post={post}
                  canEdit={isOwner}
                  onOpenActions={() => openPostActions(post)}
                />
              ))}
            </View>
          ) : (
            <View className="rounded-[28px] border border-ui-border bg-ui-light p-5">
              <Icon name="Sparkles" size={24} color={COLORS.highlight} />
              <Text className="mt-3 text-base font-semibold text-ui-shade">
                {isOwner ? "Show a little more of you" : "Nothing shared yet"}
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">
                {isOwner
                  ? "Share a thought, prompt, or photo to give people an easy conversation starter."
                  : "Posts will appear here when this person shares something."}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Actionsheet isOpen={actionSheetOpen} onClose={closePostActions}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="p-0 pb-6">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <View className="w-full p-4">
            <Text className="text-base font-semibold mb-2">Post actions</Text>
            <Pressable
              onPress={openEditPostSheet}
              className="mb-3 min-h-12 w-full flex-row items-center gap-3 rounded-full bg-ui-highlight/10 px-4 py-3 active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel="Edit post"
            >
              <Icon name="Pencil" size={18} color={COLORS.highlight} />
              <Text className="text-base font-semibold text-ui-highlight">
                Edit post
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                triggerSelectionHaptic();
                handleDeletePost();
              }}
              className="min-h-12 w-full flex-row items-center gap-3 rounded-full border border-red-200 bg-red-50 px-4 py-3 active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel="Delete post"
            >
              <Icon name="Trash2" size={18} color={COLORS.danger} />
              <Text className="text-base font-medium text-red-600">
                Delete post
              </Text>
            </Pressable>
            {actionError ? (
              <Text className="text-red-500 text-sm mt-2">{actionError}</Text>
            ) : null}
          </View>
        </ActionsheetContent>
      </Actionsheet>
      <Actionsheet isOpen={editSheetOpen} onClose={resetPostEditing}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="px-4 pb-6 pt-1">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <PostEditSheetContent
            title={getEditPostCopy().title}
            label={getEditPostCopy().label}
            placeholder={getEditPostCopy().placeholder}
            helper={getEditPostCopy().helper}
            value={editText}
            visibility={editVisibility}
            error={editError}
            isSaving={isUpdatingPost}
            onChangeText={setEditText}
            onChangeVisibility={setEditVisibility}
            onCancel={resetPostEditing}
            onSave={handleUpdatePost}
          />
        </ActionsheetContent>
      </Actionsheet>
    </ScrollView>
  );
};

export default ProfileScreen;

const PostEditSheetContent = ({
  title,
  label,
  placeholder,
  helper,
  value,
  visibility,
  error,
  isSaving,
  onChangeText,
  onChangeVisibility,
  onCancel,
  onSave,
}: {
  title: string;
  label: string;
  placeholder: string;
  helper?: string;
  value: string;
  visibility: string;
  error: string;
  isSaving: boolean;
  onChangeText: (value: string) => void;
  onChangeVisibility: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) => (
  <View className="w-full">
    <View className="mb-5 rounded-[26px] bg-ui-surface-page p-4">
      <Text
        className="text-xl font-bold leading-7 text-ui-shade"
        accessibilityRole="header"
      >
        {title}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-ui-muted">
        Update how this appears on your profile.
      </Text>
    </View>

    <View className="gap-4">
      <TextAreaInput
        label={label}
        value={value}
        action={onChangeText}
        placeholder={placeholder}
        helperText={helper}
        errorText={error}
        isDisabled={isSaving}
      />

      <View>
        <Text className="mb-2 text-sm font-semibold text-ui-shade">
          Visibility
        </Text>
        <VisibilityToggle
          field="profilePost"
          currentVisibility={visibility}
          onVisibilityChange={(_, nextVisibility) =>
            onChangeVisibility(nextVisibility)
          }
          className="w-full"
        />
      </View>
    </View>

    <View className="mt-6 flex-row gap-3">
      <Pressable
        onPress={onCancel}
        disabled={isSaving}
        className={`min-h-12 flex-1 items-center justify-center rounded-full border border-ui-border px-4 ${
          isSaving ? "opacity-60" : "active:opacity-75"
        }`}
        accessibilityRole="button"
        accessibilityLabel="Cancel editing post"
        accessibilityState={{ disabled: isSaving }}
      >
        <Text className="font-semibold text-ui-shade">Cancel</Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        disabled={isSaving}
        className={`min-h-12 flex-1 items-center justify-center rounded-full bg-ui-highlight px-4 ${
          isSaving ? "opacity-60" : "active:opacity-80"
        }`}
        accessibilityRole="button"
        accessibilityLabel="Save post changes"
        accessibilityState={{ disabled: isSaving }}
      >
        <Text className="font-semibold text-ui-light">
          {isSaving ? "Saving..." : "Save changes"}
        </Text>
      </Pressable>
    </View>
  </View>
);

const SectionHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <View className="flex-1 pr-3">
    <Text
      className="text-xl font-bold leading-6 text-ui-shade"
      accessibilityRole="header"
    >
      {title}
    </Text>
    {subtitle ? (
      <Text className="mt-1 text-sm leading-5 text-ui-muted">{subtitle}</Text>
    ) : null}
  </View>
);

const ProfileScreenSkeleton = ({ isOwner }: { isOwner: boolean }) => (
  <View className="flex-1 w-full">
    <View className="rounded-[32px] border border-ui-border bg-ui-light p-5">
      <View className="flex-row gap-4 items-center">
        <Skeleton width={112} height={112} radius={28} />
        <View className="flex-1">
          <Skeleton width="58%" height={22} />
          <View className="flex-row gap-2 mt-3">
            <Skeleton width={50} height={14} />
            <Skeleton width={64} height={14} />
            <Skeleton width={58} height={14} />
          </View>
        </View>
      </View>
      <View className="mt-5">
        <Skeleton width={76} height={12} />
        <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
        <Skeleton width="72%" height={14} style={{ marginTop: 10 }} />
      </View>
      {isOwner ? (
        <View className="mt-4 flex-row gap-2">
          <Skeleton width="49%" height={44} radius={12} />
          <Skeleton width="49%" height={44} radius={12} />
        </View>
      ) : null}
    </View>

    <View className="mt-4 rounded-2xl bg-white border border-ui-shade/10 p-4">
      <Skeleton width={90} height={13} />
      <View className="flex-row flex-wrap mt-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton
            key={`snapshot-pill-${index}`}
            width={index % 2 === 0 ? 92 : 118}
            height={34}
            radius={999}
            style={{ marginRight: 8, marginBottom: 8 }}
          />
        ))}
      </View>
      <Skeleton width="100%" height={1} style={{ marginTop: 6 }} />
      {Array.from({ length: 4 }).map((_, index) => (
        <View
          key={`snapshot-row-${index}`}
          className="flex-row items-center mt-4"
        >
          <Skeleton width={24} height={24} radius={999} />
          <Skeleton
            width={index % 2 ? "55%" : "70%"}
            height={14}
            style={{ marginLeft: 10 }}
          />
        </View>
      ))}
    </View>

    <View className="mt-4">
      <Skeleton width={120} height={20} />
      <PostsSectionSkeleton />
    </View>
  </View>
);

const ThisOrThatSectionSkeleton = () => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    className="mt-3"
    contentContainerStyle={{ gap: 12 }}
  >
    {Array.from({ length: 2 }).map((_, index) => (
      <View
        key={`this-or-that-skeleton-${index}`}
        className="w-56 rounded-xl border border-ui-shade/10 bg-ui-light overflow-hidden p-3"
      >
        <Skeleton width="100%" height={112} radius={10} />
        <Skeleton width="40%" height={10} style={{ marginTop: 12 }} />
        <Skeleton width="88%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="52%" height={10} style={{ marginTop: 8 }} />
      </View>
    ))}
  </ScrollView>
);

const PostsSectionSkeleton = () => (
  <View className="gap-3 mt-2">
    {Array.from({ length: 3 }).map((_, index) => (
      <View
        key={`post-skeleton-${index}`}
        className="border border-ui-shade/10 rounded-2xl bg-white p-4"
      >
        <Skeleton width={index % 2 ? "74%" : "62%"} height={13} />
        <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
        <Skeleton width="82%" height={14} style={{ marginTop: 9 }} />
        <Skeleton width="44%" height={14} style={{ marginTop: 9 }} />
      </View>
    ))}
  </View>
);

const ActionPill = ({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={() => {
      triggerSelectionHaptic();
      onPress();
    }}
    className="min-h-12 flex-row items-center gap-2 rounded-full bg-ui-highlight/5 px-3.5 py-2.5 active:opacity-70"
    hitSlop={4}
    accessibilityRole="button"
    accessibilityLabel={`Open ${label}`}
  >
    <Icon name={icon} size={16} color={COLORS.highlight} />
    <Text className="text-sm font-medium text-ui-shade">{label}</Text>
  </Pressable>
);

const InfoItemVerticle = ({
  icon,
  type,
  value,
  size = 24,
}: {
  icon: string;
  type: string;
  size?: number;
  value: string | number;
}) => (
  <View className="min-w-20 flex-row items-center gap-3 border-b border-ui-border py-3.5">
    <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-highlight/5">
      <Icon name={icon} type={type} size={size} className="" />
    </View>
    <Text className="flex-1 text-base leading-6 text-ui-shade">{value}</Text>
  </View>
);

const PostCard = ({
  post,
  canEdit,
  onOpenActions,
}: {
  post: any;
  canEdit: boolean;
  onOpenActions: () => void;
}) => {
  return (
    <View className="relative overflow-hidden rounded-[28px] bg-ui-light">
      {canEdit ? (
        <Pressable
          onPress={() => {
            triggerSelectionHaptic();
            onOpenActions();
          }}
          className="absolute right-3 top-3 z-10 h-11 w-11 items-center justify-center rounded-full bg-ui-light/90 active:opacity-75"
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Open post actions"
        >
          <Icon name="EllipsisVertical" size={17} color={COLORS.shade} />
        </Pressable>
      ) : null}
      <View className="min-h-32">
        {post?.type === "PROMPT" ? <PromptPost post={post} /> : null}
        {post?.type === "IMAGE" ? <ImagePost post={post} /> : null}
        {post?.type === "TEXT" ? <TextPost post={post} /> : null}
      </View>
    </View>
  );
};

const PromptPost = ({ post }: { post: any }) => {
  const promptText = post?.content?.promptId?.text || "";
  const answer = post?.content?.promptAnswer || "";
  return (
    <View className="p-5">
      <View className="mb-4 h-1 w-12 rounded-full bg-ui-accent" />
      <Text className="text-[15px] font-semibold leading-5 text-ui-muted">
        {promptText || "A prompt worth answering"}
      </Text>
      <Text className="mt-3 text-[26px] font-bold leading-9 text-ui-shade">
        {answer || "No answer added yet."}
      </Text>
    </View>
  );
};

const ImagePost = ({ post }: { post: any }) => {
  const imageSource = post?.content?.imageUrls || post?.content?.imageUrl;
  const imageUrl = Array.isArray(imageSource) ? imageSource[0] : imageSource;
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  return (
    <View>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-full"
          accessibilityLabel="User created profile post image"
          style={{
            aspectRatio: Math.max(0.78, Math.min(imageAspectRatio, 1.12)),
            resizeMode: "cover",
          }}
          onLoad={({ nativeEvent }) => {
            const width = nativeEvent?.source?.width;
            const height = nativeEvent?.source?.height;
            if (width && height) {
              setImageAspectRatio(width / height);
            }
          }}
        />
      ) : (
        <View className="h-72 items-center justify-center bg-ui-surface-page">
          <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-ui-accent/10">
            <Icon name="ImageOff" size={18} color={COLORS.accent} />
          </View>
          <Text className="text-sm font-medium text-ui-shade">
            Image unavailable
          </Text>
        </View>
      )}
      {post?.content?.caption ? (
        <View className="px-5 py-4">
          <Text className="text-[22px] font-bold leading-8 text-ui-shade">
            {post.content.caption}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const TextPost = ({ post }: { post: any }) => (
  <View className="p-5">
    <View className="mb-4 h-1 w-12 rounded-full bg-ui-highlight" />
    <Text className="text-[26px] font-bold leading-9 text-ui-shade">
      {post?.content?.text || "No text added yet."}
    </Text>
  </View>
);
