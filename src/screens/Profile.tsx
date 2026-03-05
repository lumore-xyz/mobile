import LogoPrefrenceSetting from "@/src/components/headers/LogoPrefrenceSetting";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import Skeleton from "@/src/components/ui/Skeleton";
import { useUser } from "@/src/hooks/useUser";
import {
  deletePost,
  fetchUserThisOrThatAnswers,
  startDiditVerification,
} from "@/src/libs/apis";
import Icon from "@/src/libs/Icon";
import { extractFullAddressParts } from "@/src/service/providers/LocationProvider";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";
import { calculateAge, convertHeight, distanceDisplay } from "@/src/utils";
import { languageDisplay } from "@/src/utils/helpers/languageDisplay";
import { ThisOrThatAnswer } from "@/src/utils/types";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useRef, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import { useUserPosts } from "../hooks/useUserPosts";
import { useUserPrefrence } from "../hooks/useUserPrefrence";

interface ProfileScreenProps {
  profileUserId?: string;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ profileUserId }) => {
  const currentUser = getUser();
  const currentUserId = currentUser?._id;
  const targetUserId = profileUserId || currentUserId;
  const isOwner = targetUserId === currentUserId;

  const { user, isLoading: isUserLoading } = useUser(targetUserId) as any;
  const { posts, isLoading: isPostsLoading } = useUserPosts(targetUserId);
  const { userPrefrence, isLoading: isPreferenceLoading } =
    useUserPrefrence(targetUserId);
  const scrollRef = useRef<ScrollView>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [actionError, setActionError] = useState("");
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
      icon: "cake-variant-outline",
      type: "MaterialCommunityIcons",
      value: calculateAge(user.dob),
    },
    user?.gender && {
      icon: "person-outline",
      type: "Ionicons",
      value: user.gender,
    },
    user?.orientation && {
      icon: "magnet-outline",
      type: "Ionicons",
      value: user.orientation,
    },
    user?.height && {
      icon: "ruler",
      type: "MaterialCommunityIcons",
      value: convertHeight(user.height),
    },
    user?.location?.formattedAddress && {
      icon: "location-outline",
      type: "Ionicons",
      value: extractFullAddressParts(user.location.formattedAddress, [
        "district",
      ]).district,
    },
    user?.diet && {
      icon: "fast-food-outline",
      type: "Ionicons",
      value: user.diet,
    },
    user?.zodiacSign && {
      icon: "fast-food-outline",
      type: "Ionicons",
      value: user.zodiacSign,
    },
    user?.lifestyle?.drinking && {
      icon: "beer-outline",
      type: "Ionicons",
      value: user.lifestyle.drinking,
    },
    user?.lifestyle?.smoking && {
      icon: "smoking-rooms",
      type: "MaterialIcons",
      value: user.lifestyle.smoking,
    },
    user?.lifestyle?.pets && {
      icon: "paw",
      type: "MaterialCommunityIcons",
      value: user.lifestyle.pets,
    },
    user?.bloodGroup && {
      icon: "blood",
      type: "Fontisto",
      value: user.bloodGroup,
    },
  ].filter(Boolean); // remove falsy entries

  const traitsVr = [
    user?.work && {
      icon: "briefcase-outline",
      type: "Ionicons",
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
      icon: "book-outline",
      type: "Ionicons",
      size: 24,
      value: user?.religion,
    },
    user?.maritalStatus && {
      icon: "relationship.png",
      type: "image",
      size: 24,
      value: user.maritalStatus,
    },
    user?.homeTown && {
      icon: "location-outline",
      type: "Ionicons",
      size: 24,
      value: user?.homeTown,
    },
    user?.languages && {
      icon: "language-outline",
      type: "Ionicons",
      size: 24,
      value: languageDisplay(user.languages || [])?.join(", "),
    },
    user?.personalityType && {
      icon: "mask.png",
      type: "image",
      size: 24,
      value: user?.personalityType,
    },
  ].filter(Boolean); // remove falsy entries

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
    setSelectedPost(null);
    setActionError("");
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
              closePostActions();
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
        contentContainerStyle={{ padding: 12 }}
        className="w-full bg-ui-light"
      >
        <ProfileScreenSkeleton isOwner={isOwner} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={{ padding: 12 }}
      className="w-full bg-ui-light"
    >
      <View className="flex-1 w-full">
        <View className="rounded-3xl bg-white p-4 border border-ui-shade/10">
          <View className="flex flex-row gap-4 items-center justify-start">
            <View className="bg-ui-background border border-ui-shade/10 h-20 w-20 aspect-square rounded-full">
              <Image
                source={{
                  uri: user?.profilePicture
                    ? user?.profilePicture
                    : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
                }}
                style={{
                  resizeMode: "cover",
                  width: "100%",
                  height: "100%",
                  borderRadius: 9999,
                }}
              />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-semibold text-ui-shade">
                {user?.isViewerUnlockedByUser &&
                user?.realName &&
                user.nickname ? (
                  <>
                    <Text>{user.realName}</Text>
                    <Text className="text-ui-shade/60"> ({user.nickname})</Text>
                  </>
                ) : (
                  <Text>
                    {user?.nickname ? user?.nickname : user?.username}
                  </Text>
                )}{" "}
                {user?.isVerified ? (
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    className="flex-shrink-0 text-ui-highlight"
                  />
                ) : (
                  <MaterialCommunityIcons
                    name="alert-decagram-outline"
                    size={16}
                    className="flex-shrink-0 text-ui-shade/10"
                  />
                )}
              </Text>
              <View className="flex flex-row items-center justify-start gap-2 mt-1">
                <View className="flex flex-row items-center justify-center gap-1 flex-shrink-0">
                  <MaterialCommunityIcons
                    name="cake-variant-outline"
                    size={16}
                    className="flex-shrink-0"
                  />
                  <Text className="text-base">{calculateAge(user?.dob)}</Text>
                </View>

                <View className="flex flex-row items-center justify-center gap-1 flex-shrink-0">
                  <Ionicons name="person-outline" size={16} />
                  <Text className="text-base capitalize">{user?.gender}</Text>
                </View>

                <View className="flex flex-row items-center justify-center gap-1 flex-shrink-0">
                  <Ionicons
                    name="footsteps-outline"
                    size={16}
                    className="flex-shrink-0"
                  />
                  <Text className="text-base">
                    {distanceDisplay(user?.distance || 0)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View className="mt-4">
            <Text className="text-sm uppercase text-ui-shade/60">
              About you
            </Text>
            <Text className="text-base mt-2">
              {user?.bio ? user?.bio : "No bio added yet."}
            </Text>
          </View>

          {isOwner ? (
            <View className="mt-4 flex-row gap-2">
              <Pressable
                onPress={() => router.navigate("/(subpage)/edit-profile")}
                className="flex-1 border border-ui-shade/20 p-2 rounded-xl flex flex-row items-center justify-center gap-2"
              >
                <Text>Edit profile</Text>
                <Ionicons name="pencil-outline" size={16} />
              </Pressable>
              <Pressable
                onPress={() => router.navigate("/(subpage)/edit-preference")}
                className="flex-1 border border-ui-shade/20 p-2 rounded-xl flex flex-row items-center justify-center gap-2"
              >
                <Text>Edit preferences</Text>
                <Ionicons name="options-outline" size={16} />
              </Pressable>
            </View>
          ) : null}
        </View>

        {isOwner ? (
          <View className="mt-4 rounded-2xl bg-ui-light border border-ui-shade/10 p-4">
            <Text className="text-base font-semibold">Profile health</Text>
            <Text className="text-xs text-ui-shade mt-1">
              Stronger profiles get more matches.
            </Text>
            <View className="mt-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-ui-shade">
                  Profile completion
                </Text>
                <Text className="text-sm text-ui-shade">
                  {profileCompletion}%
                </Text>
              </View>
              <View className="mt-2 h-2 w-full rounded-full bg-ui-shade/10">
                <View
                  className="h-2 rounded-full bg-ui-highlight"
                  style={{ width: `${profileCompletion}%` }}
                />
              </View>
            </View>
            <View className="mt-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-ui-shade">
                  Preference completion
                </Text>
                <Text className="text-sm text-ui-shade">
                  {preferenceCompletion}%
                </Text>
              </View>
              <View className="mt-2 h-2 w-full rounded-full bg-ui-shade/10">
                <View
                  className="h-2 rounded-full bg-ui-shade"
                  style={{ width: `${preferenceCompletion}%` }}
                />
              </View>
            </View>
          </View>
        ) : null}

        {isOwner ? (
          <View className="mt-4 rounded-2xl bg-white border border-ui-shade/10 p-4">
            <Text className="text-base font-semibold">Quick actions</Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              <ActionPill
                label="Credits"
                icon="cash-outline"
                onPress={() => router.navigate("/(subpage)/credits")}
              />
              <ActionPill
                label="Referral"
                icon="gift-outline"
                onPress={() => router.navigate("/(subpage)/referral")}
              />
              <ActionPill
                label="Games"
                icon="game-controller-outline"
                onPress={() => router.navigate("/(subpage)/games")}
              />
              <ActionPill
                label="Feedback"
                icon="chatbox-ellipses-outline"
                onPress={() => router.navigate("/(subpage)/feedback")}
              />
              <ActionPill
                label="Settings"
                icon="settings-outline"
                onPress={() => router.navigate("/(subpage)/settings")}
              />
            </View>
            {!user?.isVerified ? (
              <Pressable
                onPress={handleStartVerification}
                disabled={
                  isStartingVerification ||
                  user?.verificationStatus === "pending"
                }
                className={`mt-3 rounded-xl border border-ui-highlight/30 bg-ui-highlight/10 px-4 py-3 ${
                  isStartingVerification ||
                  user?.verificationStatus === "pending"
                    ? "opacity-70"
                    : ""
                }`}
              >
                <Text className="text-ui-highlight font-semibold">
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

        <View className="my-4 border border-ui-shade/10 rounded-2xl w-full bg-white p-3">
          <Text className="text-sm uppercase text-ui-shade/60 mb-2">
            Snapshot
          </Text>
          <View className="flex-row flex-wrap">
            {traitsHr.map((trait, index) => (
              <View
                key={index}
                className="flex-row items-center gap-2 border border-ui-shade/10 rounded-full px-3 py-2 mr-2 mb-2"
              >
                <Icon
                  name={trait!.icon}
                  type={trait!.type}
                  size={16}
                  className=""
                />
                <Text className="text-sm">{trait!.value}</Text>
              </View>
            ))}
          </View>
          <View className="border-b border-ui-shade/10 w-full mt-2" />
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
        </View>

        <View className="mt-4 rounded-2xl bg-white border border-ui-shade/10 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold">This or That</Text>
            <Pressable
              onPress={() => router.navigate("/(subpage)/games/this-or-that")}
            >
              <Text className="text-xs text-ui-highlight">Play</Text>
            </Pressable>
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
                  className="w-56 rounded-xl border border-ui-shade/10 bg-ui-light overflow-hidden"
                >
                  {answer.selectedImageUrl ? (
                    <Image
                      source={{ uri: answer.selectedImageUrl }}
                      className="h-28 w-full"
                      style={{ resizeMode: "cover" }}
                    />
                  ) : null}
                  <View className="p-3">
                    <Text className="text-xs text-ui-shade/60">
                      {answer.question?.category || "general"}
                    </Text>
                    <Text className="text-sm font-semibold mt-1">
                      {answer.selectedText}
                    </Text>
                    <Text className="text-[10px] text-ui-shade/60 mt-1">
                      {new Date(answer.answeredAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View className="mt-3 rounded-xl border border-ui-shade/10 bg-ui-light p-3">
              <Text className="text-xs text-ui-shade">No answers yet.</Text>
            </View>
          )}
        </View>

        <View className="mt-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-semibold">
              {isOwner ? "Your posts" : "Posts"}
            </Text>
            {isOwner ? (
              <Pressable onPress={() => router.navigate("/create-post")}>
                <Text className="text-xs text-ui-highlight">Create new</Text>
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
            <View className="p-4 rounded-2xl bg-white border border-ui-shade/10">
              <Text className="text-sm text-ui-shade">
                No posts yet. Create your first post to show your vibe.
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
              onPress={handleDeletePost}
              className="w-full py-3 px-4 rounded-xl bg-red-50 border border-red-200"
            >
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
    </ScrollView>
  );
};

export default ProfileScreen;

const ProfileScreenSkeleton = ({ isOwner }: { isOwner: boolean }) => (
  <View className="flex-1 w-full">
    <View className="rounded-3xl bg-white p-4 border border-ui-shade/10">
      <View className="flex-row gap-4 items-center">
        <Skeleton width={80} height={80} radius={999} />
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
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center gap-2 rounded-full border border-ui-shade/10 px-3 py-2"
  >
    <Ionicons name={icon} size={14} className="text-ui-shade" />
    <Text className="text-sm text-ui-shade">{label}</Text>
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
  <View className="flex flex-row gap-2 border-b border-ui-shade/10 items-center justify-start py-3 min-w-20">
    <Icon name={icon} type={type} size={size} className="" />
    <Text className="text-base">{value}</Text>
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
    <View className="border border-ui-shade/10 rounded-2xl bg-white overflow-hidden">
      {canEdit ? (
        <Pressable
          onPress={onOpenActions}
          className="absolute right-2 top-2 z-10 p-1 bg-white/80 rounded-full"
        >
          <Icon type="Ionicons" name="ellipsis-vertical-outline" size={16} />
        </Pressable>
      ) : null}
      <View className="min-h-28">
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
    <View className="p-4 ">
      <Text className="text-ui-shade/70">{promptText}</Text>
      <Text className="text-xl font-semibold mt-2">{answer}</Text>
    </View>
  );
};

const ImagePost = ({ post }: { post: any }) => {
  const imageUrl = post?.content?.imageUrls || post?.content?.imageUrl;
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  return (
    <View>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-full"
          style={{ aspectRatio: imageAspectRatio, resizeMode: "contain" }}
          onLoad={({ nativeEvent }) => {
            const width = nativeEvent?.source?.width;
            const height = nativeEvent?.source?.height;
            if (width && height) {
              setImageAspectRatio(width / height);
            }
          }}
        />
      ) : (
        <View className="h-48 items-center justify-center">
          <Text className="text-xs text-ui-shade">Image unavailable</Text>
        </View>
      )}
      {post?.content?.caption ? (
        <View className="p-4">
          <Text className="text-sm text-ui-shade">{post.content.caption}</Text>
        </View>
      ) : null}
    </View>
  );
};

const TextPost = ({ post }: { post: any }) => (
  <View className="p-4">
    <Text className="text-xl text-ui-shade whitespace-pre-wrap">
      {post?.content?.text || ""}
    </Text>
  </View>
);
