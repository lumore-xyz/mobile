import SurfacePanel from "@/src/components/ui/SurfacePanel";
import type { ProfileUser } from "@/src/domain/profile/types";
import InterestChip from "@/src/components/profile/InterestChip";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import getAgeFromDate from "@/src/utils/helpers/getAgeFromDate";
import distanceDisplay from "@/src/utils/helpers/distanceDisplay";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ProfileSummaryCardProps {
  user?: ProfileUser;
  interests: string[];
  isOwner: boolean;
  shouldBlurProfilePicture: boolean;
  onEditProfile: () => void;
  onEditPreferences: () => void;
}

const ProfileSummaryCard = ({
  user,
  interests,
  isOwner,
  shouldBlurProfilePicture,
  onEditProfile,
  onEditPreferences,
}: ProfileSummaryCardProps) => (
  <SurfacePanel surface="paper" className="overflow-hidden">
    <View className="flex-row items-center gap-5">
      <View className="h-28 w-28 shrink-0 overflow-hidden rounded-[24px] bg-ui-porcelain">
        <Image
          source={{
            uri:
              user?.profilePicture ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
          }}
          blurRadius={shouldBlurProfilePicture ? 12 : 0}
          contentFit="cover"
          accessible
          accessibilityLabel={
            shouldBlurProfilePicture
              ? "Profile photo hidden until unlocked"
              : `Profile photo of ${user?.nickname || user?.username || "user"}`
          }
          style={{ width: "100%", height: "100%" }}
        />
      </View>
      <View className="flex-1">
        <Text
          className="font-display text-[28px] leading-8 text-ui-ink"
          accessibilityRole="header"
        >
          {user?.isViewerUnlockedByUser && user?.realName && user.nickname ? (
            <>
              <Text>{user.realName}</Text>
              <Text className="text-base font-medium text-ui-slate">
                {"\n"}@{user.nickname}
              </Text>
            </>
          ) : (
            <Text>{user?.nickname || user?.username}</Text>
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
              <Icon name="CakeSlice" size={16} className="flex-shrink-0" />
              <Text className="text-sm font-medium">
                {getAgeFromDate(user.dob)}
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
              <Icon name="Footprints" size={16} className="flex-shrink-0" />
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
        {user?.bio || "No bio added yet."}
      </Text>
      {interests.length ? (
        <View className="mt-4 border-t border-ui-parchment pt-4">
          <Text className="text-sm font-semibold text-ui-slate">Interests</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {interests.map((interest) => (
              <InterestChip key={interest} interest={interest} />
            ))}
          </View>
        </View>
      ) : null}
    </View>

    {isOwner ? (
      <View className="mt-5 flex-row gap-3">
        <Pressable
          onPress={onEditProfile}
          className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-4 active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Edit profile details"
        >
          <Icon name="Pencil" size={16} color={COLORS.paper} />
          <Text className="font-semibold text-ui-paper">Edit profile</Text>
        </Pressable>
        <Pressable
          onPress={onEditPreferences}
          className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-ui-forest/30 px-4 active:bg-ui-forest/5"
          accessibilityRole="button"
          accessibilityLabel="Edit match preferences"
        >
          <Icon name="SlidersHorizontal" size={16} color={COLORS.forest} />
          <Text className="font-semibold text-ui-forest">Preferences</Text>
        </Pressable>
      </View>
    ) : null}
  </SurfacePanel>
);

export default ProfileSummaryCard;
