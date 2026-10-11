import ProfileFact from "@/src/components/explore/ProfileFact";
import RejectProfileSheet from "@/src/components/explore/RejectProfileSheet";
import styles from "@/src/components/explore/ExploreStyles";
import InterestChip from "@/src/components/profile/InterestChip";
import { ExploreProfile, RejectExploreProfileInput } from "@/src/features/explore/api";
import formatGender from "@/src/features/explore/formatGender";
import { useAd } from "@/src/hooks/useAd";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { memo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import distanceDisplay from "@/src/utils/helpers/distanceDisplay";

const ProfileCard = memo(function ProfileCard({
  profile,
  opening,
  rejecting,
  disabled,
  onHello,
  onReject,
}: {
  profile: ExploreProfile;
  opening: boolean;
  rejecting: boolean;
  disabled: boolean;
  onHello: (id: string) => void;
  onReject: (id: string, input: RejectExploreProfileInput) => Promise<void>;
}) {
  const [rejectSheetOpen, setRejectSheetOpen] = useState(false);
  const { showRewarded } = useAd();
  const name = profile.nickname?.trim() || "Someone new";
  const gender = formatGender(profile.gender);
  const distance = distanceDisplay(profile.distanceKm || 0);
  const matchNote = profile.matchNote;
  const openProfile = async () => {
    await showRewarded();
    router.push({
      pathname: "/(subpage)/profile/[userId]",
      params: { userId: profile._id },
    });
  };

  return (
    <View style={styles.profileCard} className="rounded-[24px] border border-ui-parchment bg-ui-paper">
      <Pressable
        onPress={() => void openProfile()}
        accessibilityRole="button"
        accessibilityLabel={`View ${name}'s profile`}
        style={styles.profileHeader}
        className="flex-row items-start active:opacity-75 mb-4"
      >
        <View style={styles.avatarFrame}>
          <View style={styles.avatarClip} className="rounded-[26px] bg-ui-midnight">
            {profile.profilePicture ? (
              <Image
                source={{ uri: profile.profilePicture }}
                style={styles.avatar}
                contentFit="cover"
                blurRadius={5}
                cachePolicy="memory"
                recyclingKey={profile._id}
                accessibilityLabel={`Blurred profile photo for ${name}`}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Icon name="UserRound" size={34} color={COLORS.porcelain} />
              </View>
            )}
          </View>
        </View>

        <View style={styles.profileDetails} className="min-w-0 flex-1">
          <View className="flex-row items-center justify-between gap-2">
            <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
              <Text
                className="flex-shrink text-2xl font-semibold text-ui-midnight"
                accessibilityRole="header"
                numberOfLines={1}
              >
                {name}
              </Text>
              {profile.isVerified ? (
                <View accessible accessibilityLabel="Verified profile">
                  <Icon name="BadgeCheck" size={20} color={COLORS.forest} />
                </View>
              ) : null}
            </View>
            <Icon name="ChevronRight" size={20} color={COLORS.slate} />
          </View>

          {typeof profile.age === "number" || gender ? (
            <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1.5">
              {typeof profile.age === "number" ? (
                <ProfileFact icon="Cake" text={`${profile.age}`} />
              ) : null}
              {gender ? <ProfileFact icon="UserRound" text={gender} /> : null}
              {distance ? <ProfileFact icon="MapPin" text={distance} /> : null}
            </View>
          ) : null}

          <View className="self-start flex-row items-center gap-2 rounded-full bg-ui-champagne/20 p-1.5 pr-3">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="Sparkles" size={16} color={COLORS.ink} />
            </View>
            <View
              accessible
              accessibilityLabel={`Compatibility score ${Math.round(profile.score)} out of 100`}
            >
              <Text className="text-sm font-semibold text-ui-ink">
                {Math.round(profile.score)} / 100
              </Text>
              <Text className="text-[11px] font-medium text-ui-midnight">
                Compatibility
              </Text>
            </View>
          </View>
        </View>
      </Pressable>

      <View style={styles.cardBody}>
        {profile.interests?.length ? (
          <View className="flex-row flex-wrap gap-2">
            {profile.interests.slice(0, 3).map((interest) => (
              <InterestChip
                key={interest}
                interest={interest}
                variant="explore"
              />
            ))}
          </View>
        ) : null}

        <View
          style={styles.matchNote}
          className="flex-row items-center rounded-[22px] border-0 bg-ui-surface-page"
        >
          <Icon name="Sparkles" size={28} color={COLORS.aubergine} />
          <Text
            style={{ borderLeftWidth: 0, borderColor: "transparent" }}
            className="mt-1 flex-1 text-[15px] leading-6 text-ui-midnight"
          >
            {matchNote}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              setRejectSheetOpen(true);
            }}
            disabled={disabled}
            className={`h-14 w-14 items-center justify-center rounded-full border border-ui-parchment bg-ui-surface-page active:opacity-70 ${disabled ? "opacity-40" : ""}`}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${name} from Explore`}
            accessibilityHint="Opens a feedback sheet before removing this suggestion"
            accessibilityState={{ disabled }}
          >
            <Icon name="ThumbsDown" size={23} color={COLORS.danger} />
          </Pressable>
          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              onHello(profile._id);
            }}
            disabled={disabled}
            className={`h-14 w-14 items-center justify-center rounded-2xl bg-ui-forest active:opacity-80 ${disabled ? "opacity-40" : ""}`}
            accessibilityRole="button"
            accessibilityLabel={`Say hello to ${name}`}
            accessibilityState={{ busy: opening, disabled }}
          >
            {opening ? (
              <ActivityIndicator size="small" color={COLORS.paper} />
            ) : (
              <Icon name="MessageCircle" size={24} color={COLORS.paper} />
            )}
          </Pressable>
        </View>
      </View>
      <RejectProfileSheet
        isOpen={rejectSheetOpen}
        name={name}
        submitting={rejecting}
        onClose={() => setRejectSheetOpen(false)}
        onSubmit={(input) => onReject(profile._id, input)}
      />
    </View>
  );
});

export default ProfileCard;
