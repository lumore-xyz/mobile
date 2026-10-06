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
import type { ProfilePost } from "@/src/domain/profile/types";
import { fetchProfileCompatibility } from "@/src/features/explore/api";
import {
  deletePost,
  fetchUserThisOrThatAnswers,
  startHaloKycVerification,
  updatePost,
} from "@/src/libs/apis";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import OptionIcon from "@/src/libs/OptionIcon";
import { interestOptions } from "@/src/libs/options";
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
import { Image } from "expo-image";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image as NativeImage,
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

  const { user, isLoading: isUserLoading } = useUser(targetUserId);
  const { posts, isLoading: isPostsLoading } = useUserPosts(targetUserId);
  const { userPrefrence, isLoading: isPreferenceLoading } =
    useUserPrefrence(targetUserId);
  const sharedInterests = Array.isArray(user?.interests)
    ? user.interests.filter(
        (interest: unknown): interest is string =>
          typeof interest === "string" && interest.trim().length > 0,
      )
    : [];
  const shouldBlurProfilePicture =
    !isOwner && !user?.isViewerUnlockedByUser && Boolean(user?.profilePicture);
  const scrollRef = useRef<ScrollView>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ProfilePost | null>(null);
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

  const { data: compatibility, isLoading: isCompatibilityLoading } = useQuery({
    queryKey: ["profile-compatibility", currentUserId, targetUserId],
    queryFn: () => fetchProfileCompatibility(targetUserId),
    enabled: Boolean(targetUserId && !isOwner),
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

  const openPostActions = (post: ProfilePost) => {
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

  const getEditablePostText = (post: ProfilePost) => {
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
        helper:
          typeof selectedPost.content.promptId === "object"
            ? selectedPost.content.promptId?.text
            : undefined,
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
              typeof selectedPost.content.promptId === "object"
                ? selectedPost.content.promptId?._id
                : selectedPost.content.promptId,
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
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        className="w-full flex-1 bg-ui-surface-page"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.forest}
              colors={[COLORS.forest]}
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
            tintColor={COLORS.forest}
            colors={[COLORS.forest]}
          />
        ) : undefined
      }
    >
      <View className="flex-1 w-full">
        <View className="overflow-hidden rounded-[24px] border border-ui-parchment bg-ui-paper p-5">
          <View className="flex-row items-center gap-5">
            <View className="h-28 w-28 shrink-0 overflow-hidden rounded-[24px] bg-ui-porcelain">
              <Image
                source={{
                  uri: user?.profilePicture
                    ? user?.profilePicture
                    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                }}
                blurRadius={shouldBlurProfilePicture ? 12 : 0}
                contentFit="cover"
                accessible
                accessibilityLabel={
                  shouldBlurProfilePicture
                    ? "Profile photo hidden until unlocked"
                    : `Profile photo of ${user?.nickname || user?.username || "user"}`
                }
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </View>
            <View className="flex-1">
              <Text
                className="font-display text-[28px] leading-8 text-ui-ink"
                accessibilityRole="header"
              >
                {user?.isViewerUnlockedByUser &&
                user?.realName &&
                user.nickname ? (
                  <>
                    <Text>{user.realName}</Text>
                    <Text className="text-base font-medium text-ui-slate">
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
                    color={COLORS.forest}
                    className="flex-shrink-0"
                  />
                ) : isOwner ? (
                  <Icon
                    name="BadgeAlert"
                    size={16}
                    className="flex-shrink-0 text-ui-slate"
                  />
                ) : null}
              </Text>
              <View className="mt-3 flex-row flex-wrap items-center gap-2">
                {user?.dob ? (
                  <View className="flex-row items-center gap-1 rounded-full bg-ui-forest/5 px-2.5 py-1.5">
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
                  <View className="flex-row items-center gap-1 rounded-full bg-ui-forest/5 px-2.5 py-1.5">
                    <Icon name="UserRound" size={16} />
                    <Text className="text-sm font-medium capitalize">
                      {user.gender}
                    </Text>
                  </View>
                ) : null}

                {user?.distance != null ? (
                  <View className="flex-row items-center gap-1 rounded-full bg-ui-forest/5 px-2.5 py-1.5">
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

          <View className="mt-6 border-t border-ui-parchment pt-5">
            <Text className="text-sm font-semibold text-ui-slate">
              {isOwner ? "About you" : "About"}
            </Text>
            <Text className="mt-2 text-base leading-6 text-ui-ink">
              {user?.bio ? user?.bio : "No bio added yet."}
            </Text>
            {sharedInterests.length ? (
              <View className="mt-4 border-t border-ui-parchment pt-4">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm font-semibold text-ui-slate">
                    Interests
                  </Text>
                </View>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  {sharedInterests.map((interest : string) => (
                    <View
                      key={interest}
                      className="flex-row items-center gap-1.5 rounded-full bg-ui-forest/5 px-3 py-2"
                    >
                      <OptionIcon
                        icon={
                          interestOptions.find(
                            (option) => option.value === interest,
                          )?.icon
                        }
                        size={14}
                        color={COLORS.forest}
                      />
                      <Text className="text-sm font-medium capitalize text-ui-ink">
                        {interestOptions.find(
                          (option) => option.value === interest,
                        )?.label || interest}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>

          {isOwner ? (
            <View className="mt-5 flex-row gap-3">
              <Pressable
                onPress={() => {
                  triggerSelectionHaptic();
                  router.navigate("/(subpage)/edit-profile");
                }}
                className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-4 active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel="Edit profile details"
              >
                <Icon name="Pencil" size={16} color={COLORS.paper} />
                <Text className="font-semibold text-ui-paper">
                  Edit profile
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  triggerSelectionHaptic();
                  router.navigate("/(subpage)/edit-preference");
                }}
                className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-ui-forest/30 px-4 active:bg-ui-forest/5"
                accessibilityRole="button"
                accessibilityLabel="Edit match preferences"
              >
                <Icon
                  name="SlidersHorizontal"
                  size={16}
                  color={COLORS.forest}
                />
                <Text className="font-semibold text-ui-forest">
                  Preferences
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {!isOwner ? (
          <View className="mt-5 flex-row items-center justify-between gap-4 rounded-[24px] border border-ui-parchment bg-ui-paper p-5">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-champagne">
                <Icon name="Sparkles" size={20} color={COLORS.ink} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-ui-ink">
                  Profile compatibility
                </Text>
                <Text className="mt-0.5 text-xs leading-4 text-ui-slate">
                  Freshly calculated from your preferences and this profile.
                </Text>
              </View>
            </View>
            <View className="min-w-20 items-center rounded-2xl bg-ui-champagne px-3 py-2">
              {isCompatibilityLoading ? (
                <ActivityIndicator size="small" color={COLORS.ink} />
              ) : compatibility ? (
                <>
                  <Text className="text-xl font-semibold text-ui-ink">
                    {Math.round(compatibility.score)}
                  </Text>
                  <Text className="text-xs font-semibold text-ui-ink">
                    / 100
                  </Text>
                </>
              ) : (
                <Text className="text-xs font-semibold text-ui-slate">
                  Unavailable
                </Text>
              )}
            </View>
          </View>
        ) : null}

        {isOwner ? (
          <View className="mt-5 rounded-[24px] bg-ui-midnight p-5">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1">
                <Text
                  className="text-xl font-bold text-ui-paper"
                  accessibilityRole="header"
                >
                  Make your profile magnetic
                </Text>
                <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
                  Complete a few more details to help better matches find you.
                </Text>
              </View>
              <View className="h-11 min-w-14 items-center justify-center rounded-full bg-ui-champagne px-3">
                <Text className="font-bold text-ui-ink">
                  {profileCompletion}%
                </Text>
              </View>
            </View>
            <Text className="mt-5 text-sm font-medium text-ui-paper">
              Profile details
            </Text>
            <View className="mt-2 h-2.5 w-full rounded-full bg-ui-paper/15">
              <View
                className="h-2.5 rounded-full bg-ui-champagne"
                style={{ width: `${profileCompletion}%` }}
              />
            </View>
            <View className="mt-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-ui-paper">
                  Match preferences
                </Text>
                <Text className="text-sm font-semibold text-ui-paper">
                  {preferenceCompletion}%
                </Text>
              </View>
              <View className="mt-2 h-2.5 w-full rounded-full bg-ui-paper/15">
                <View
                  className="h-2.5 rounded-full bg-ui-aubergine"
                  style={{ width: `${preferenceCompletion}%` }}
                />
              </View>
            </View>
          </View>
        ) : null}

        {isOwner ? (
          <View className="mt-5 rounded-[24px] border border-ui-parchment bg-ui-paper p-5">
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
                className={`mt-4 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-ui-forest/30 bg-ui-forest/10 px-4 py-3 active:opacity-80 ${
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
                <Icon name="BadgeCheck" size={18} color={COLORS.forest} />
                <Text className="font-semibold text-ui-forest">
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

        <View className="mt-5 w-full rounded-[24px] border border-ui-parchment bg-ui-paper p-5">
          <SectionHeading
            title="The essentials"
            subtitle="A quick glimpse at personality and lifestyle"
          />
          <View className="flex-row flex-wrap">
            {traitsHr.map((trait, index) => (
              <View
                key={index}
                className="mb-2 mr-2 flex-row items-center gap-2 rounded-full bg-ui-forest/5 px-3 py-2.5"
              >
                <Icon name={trait!.icon} size={16} className="" />
                <Text className="text-sm">{trait!.value}</Text>
              </View>
            ))}
          </View>
          {traitsHr.length || traitsVr.length ? (
            <>
              {traitsVr.length ? (
                <View className="mt-3 h-px w-full bg-ui-parchment" />
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
            <View className="mt-3 rounded-2xl bg-ui-forest/5 p-4">
              <Text className="text-sm leading-5 text-ui-slate">
                {isOwner
                  ? "Add profile details to build your snapshot."
                  : "No public details yet."}
              </Text>
            </View>
          )}
        </View>

        {!isOwner ? <ProfileNativeAd /> : null}

        <View className="mt-5 rounded-[24px] border border-ui-parchment bg-ui-paper p-5">
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
                className="min-h-11 justify-center rounded-full bg-ui-forest/10 px-4 active:opacity-75"
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Play This or That"
              >
                <Text className="text-sm font-semibold text-ui-forest">
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
                  className="w-64 overflow-hidden rounded-3xl bg-ui-forest/5"
                >
                  {answer.selectedImageUrl ? (
                    <NativeImage
                      source={{ uri: answer.selectedImageUrl }}
                      className="h-28 w-full"
                      resizeMode="cover"
                    />
                  ) : null}
                  <View className="p-3">
                    <Text className="text-xs font-medium capitalize text-ui-slate">
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
            <View className="mt-4 rounded-2xl bg-ui-forest/5 p-4">
              <Text className="text-sm text-ui-slate">
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
                className="min-h-11 justify-center rounded-full bg-ui-forest/10 px-4 active:opacity-75"
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Create a new post"
              >
                <Text className="text-sm font-semibold text-ui-forest">
                  Create
                </Text>
              </Pressable>
            ) : null}
          </View>
          {isPostsLoading ? (
            <PostsSectionSkeleton />
          ) : posts?.length ? (
            <View className="gap-3">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  canEdit={isOwner}
                  onOpenActions={() => openPostActions(post)}
                />
              ))}
            </View>
          ) : (
            <View className="rounded-[24px] border border-ui-parchment bg-ui-paper p-5">
              <Icon name="Sparkles" size={24} color={COLORS.forest} />
              <Text className="mt-3 text-base font-semibold text-ui-ink">
                {isOwner ? "Show a little more of you" : "Nothing shared yet"}
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
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
              className="mb-3 min-h-12 w-full flex-row items-center gap-3 rounded-full bg-ui-forest/10 px-4 py-3 active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel="Edit post"
            >
              <Icon name="Pencil" size={18} color={COLORS.forest} />
              <Text className="text-base font-semibold text-ui-forest">
                Edit post
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                triggerSelectionHaptic();
                handleDeletePost();
              }}
              className="min-h-12 w-full flex-row items-center gap-3 rounded-2xl border border-ui-danger/25 bg-ui-danger/5 px-4 py-3 active:opacity-75"
              accessibilityRole="button"
              accessibilityLabel="Delete post"
            >
              <Icon name="Trash2" size={18} color={COLORS.danger} />
              <Text className="text-base font-medium text-ui-danger">
                Delete post
              </Text>
            </Pressable>
            {actionError ? (
              <Text className="text-ui-danger text-sm mt-2">{actionError}</Text>
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
        className="text-xl font-bold leading-7 text-ui-ink"
        accessibilityRole="header"
      >
        {title}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-ui-slate">
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
        <Text className="mb-2 text-sm font-semibold text-ui-ink">
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
        className={`min-h-12 flex-1 items-center justify-center rounded-full border border-ui-parchment px-4 ${
          isSaving ? "opacity-60" : "active:opacity-75"
        }`}
        accessibilityRole="button"
        accessibilityLabel="Cancel editing post"
        accessibilityState={{ disabled: isSaving }}
      >
        <Text className="font-semibold text-ui-ink">Cancel</Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        disabled={isSaving}
        className={`min-h-12 flex-1 items-center justify-center rounded-2xl bg-ui-forest px-4 ${
          isSaving ? "opacity-60" : "active:opacity-80"
        }`}
        accessibilityRole="button"
        accessibilityLabel="Save post changes"
        accessibilityState={{ disabled: isSaving }}
      >
        <Text className="font-semibold text-ui-paper">
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
      className="text-xl font-bold leading-6 text-ui-ink"
      accessibilityRole="header"
    >
      {title}
    </Text>
    {subtitle ? (
      <Text className="mt-1 text-sm leading-5 text-ui-slate">{subtitle}</Text>
    ) : null}
  </View>
);

const ProfileScreenSkeleton = ({ isOwner }: { isOwner: boolean }) => (
  <View className="flex-1 w-full">
    <View className="rounded-[24px] border border-ui-parchment bg-ui-paper p-5">
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

    <View className="mt-4 rounded-2xl bg-ui-paper border border-ui-ink/10 p-4">
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
        className="w-56 rounded-xl border border-ui-ink/10 bg-ui-paper overflow-hidden p-3"
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
        className="border border-ui-ink/10 rounded-2xl bg-ui-paper p-4"
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
    className="min-h-12 flex-row items-center gap-2 rounded-full bg-ui-forest/5 px-3.5 py-2.5 active:opacity-70"
    hitSlop={4}
    accessibilityRole="button"
    accessibilityLabel={`Open ${label}`}
  >
    <Icon name={icon} size={16} color={COLORS.forest} />
    <Text className="text-sm font-medium text-ui-ink">{label}</Text>
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
  <View className="min-w-20 flex-row items-center gap-3 border-b border-ui-parchment py-3.5">
    <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-forest/5">
      <Icon name={icon} type={type} size={size} className="" />
    </View>
    <Text className="flex-1 text-base leading-6 text-ui-ink">{value}</Text>
  </View>
);

const PostCard = ({
  post,
  canEdit,
  onOpenActions,
}: {
  post: ProfilePost;
  canEdit: boolean;
  onOpenActions: () => void;
}) => {
  return (
    <View
      className={`relative overflow-hidden rounded-[24px] border ${
        post.type === "PROMPT"
          ? "border-ui-midnight bg-ui-midnight"
          : "border-ui-parchment bg-ui-paper"
      }`}
    >
      {canEdit ? (
        <Pressable
          onPress={() => {
            triggerSelectionHaptic();
            onOpenActions();
          }}
          className={`absolute right-3 top-3 z-10 h-11 w-11 items-center justify-center rounded-full active:opacity-75 ${
            post.type === "PROMPT" ? "bg-ui-paper/15" : "bg-ui-paper/90"
          }`}
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Open post actions"
        >
          <Icon
            name="EllipsisVertical"
            size={17}
            color={post.type === "PROMPT" ? COLORS.paper : COLORS.ink}
          />
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

const PromptPost = ({ post }: { post: ProfilePost }) => {
  const promptText =
    typeof post.content.promptId === "object"
      ? post.content.promptId?.text || ""
      : "";
  const answer = post?.content?.promptAnswer || "";
  return (
    <View className="p-6">
      <View className="flex-row items-center gap-2">
        <View className="h-1 w-7 rounded-full bg-ui-champagne" />
        <Text className="text-[11px] font-bold uppercase tracking-[1.5px] text-ui-champagne">
          Get to know me
        </Text>
      </View>
      <View className="mt-6 pr-8">
        <Text className="text-base font-medium leading-6 text-ui-paper/75">
          {promptText || "A prompt worth answering"}
        </Text>
        <ExpandablePostText
          text={answer || "No answer added yet."}
          className="mt-3 text-[27px] font-semibold leading-8 text-ui-paper"
        />
      </View>
    </View>
  );
};

const ExpandablePostText = ({
  text,
  className,
  numberOfLines = 4,
}: {
  text: string;
  className: string;
  numberOfLines?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const canExpand = text.length > 150;

  return (
    <View>
      <Text
        className={className}
        numberOfLines={canExpand && !expanded ? numberOfLines : undefined}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
      {canExpand ? (
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          className="mt-2 min-h-11 self-start justify-center py-1"
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Show less post text" : "Read more post text"}
          accessibilityState={{ expanded }}
        >
          <Text className="text-sm font-bold text-ui-champagne">
            {expanded ? "Show less" : "Read more"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const ImagePost = ({ post }: { post: ProfilePost }) => {
  const imageSource = post?.content?.imageUrls || post?.content?.imageUrl;
  const imageUrl = Array.isArray(imageSource) ? imageSource[0] : imageSource;
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  return (
    <View>
      {imageUrl && !imageUnavailable ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-full"
          accessibilityLabel="User created profile post image"
          contentFit="cover"
          transition={180}
          cachePolicy="memory-disk"
          style={{
            aspectRatio: Math.max(0.78, Math.min(imageAspectRatio, 1.12)),
          }}
          onError={() => setImageUnavailable(true)}
          onLoad={(event) => {
            const width = event?.source?.width;
            const height = event?.source?.height;
            if (width && height) {
              setImageAspectRatio(width / height);
            }
          }}
        />
      ) : (
        <View className="h-72 items-center justify-center bg-ui-midnight px-6">
          <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-ui-aubergine/10">
            <Icon name="ImageOff" size={18} color={COLORS.aubergine} />
          </View>
          <Text className="text-sm font-medium text-ui-paper">
            Image unavailable
          </Text>
        </View>
      )}
      {post?.content?.caption ? (
        <View className="bg-ui-midnight px-5 pb-5 pt-4">
          <View className="mb-3 h-1 w-10 rounded-full bg-ui-champagne" />
          <ExpandablePostText
            text={post.content.caption}
            numberOfLines={3}
            className="text-[21px] font-bold leading-7 text-ui-paper"
          />
        </View>
      ) : null}
    </View>
  );
};

const TextPost = ({ post }: { post: ProfilePost }) => (
  <View className="p-5">
    <View className="mb-4 h-1 w-12 rounded-full bg-ui-forest" />
    <Text className="text-[26px] font-bold leading-9 text-ui-ink">
      {post?.content?.text || "No text added yet."}
    </Text>
  </View>
);
