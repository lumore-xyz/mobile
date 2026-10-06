import LogoPrefrence from "@/src/components/headers/LogoPrefrence";
import Button from "@/src/components/ui/Button";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import { TextAreaInput } from "@/src/components/ui/TextInput";
import {
  ExploreProfile,
  RejectExploreProfileInput,
} from "@/src/features/explore/api";
import { getExploreErrorAction } from "@/src/features/explore/state";
import { useDailyExplore } from "@/src/features/explore/useDailyExplore";
import { fetchCreditsBalance } from "@/src/libs/apis";
import { COLORS } from "@/src/libs/constants/theme";
import { useAd } from "@/src/hooks/useAd";
import Icon from "@/src/libs/Icon";
import OptionIcon from "@/src/libs/OptionIcon";
import { interestOptions } from "@/src/libs/options";
import {
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from "@/src/utils/haptics";
import { toUserFacingError } from "@/src/utils/userFacingError";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { distanceDisplay } from "../utils";
import BOUQUET_IMAGE from "@/assets/images/bouquet.png";
import DISCOVERY_BACKGROUND from "@/assets/images/login-screen.webp";

const REJECTION_REASONS = [
  { label: "Not my type", value: "not_my_type" },
  { label: "Different intentions", value: "different_intentions" },
  { label: "Too far away", value: "too_far_away" },
  { label: "Profile feels incomplete", value: "profile_incomplete" },
  { label: "Something else", value: "other" },
] as const;

const keyExtractor = (profile: ExploreProfile) => profile._id;

const formatGender = (gender?: string) =>
  gender
    ? gender
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "";


const ProfileFact = ({ icon, text }: { icon: string; text: string }) => (
  <View className="flex-row items-center gap-1.5">
    <Icon name={icon} size={16} color={COLORS.slate} />
    <Text className="text-sm font-medium text-ui-slate">{text}</Text>
  </View>
);

const RejectProfileSheet = ({
  isOpen,
  name,
  submitting,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  name: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: RejectExploreProfileInput) => Promise<void>;
}) => {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const close = () => {
    if (submitting) return;
    setReason("");
    setFeedback("");
    setError("");
    onClose();
  };

  const submit = async () => {
    if (!reason) {
      setError("Choose a reason before removing this suggestion.");
      return;
    }
    try {
      await onSubmit({ reason, feedback: feedback.trim() || undefined });
      triggerSuccessHaptic();
      close();
    } catch {
      // The request hook owns the user-facing network error.
    }
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={close}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="p-0">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ScrollView
          className="w-full"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          <View className="mb-5 flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-2xl font-semibold text-ui-midnight">
                Remove {name}?
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                They will disappear from Explore. Your feedback stays private.
              </Text>
            </View>
            <Pressable
              onPress={close}
              disabled={submitting}
              className="h-11 w-11 items-center justify-center rounded-full bg-ui-surface-page active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Close rejection feedback"
            >
              <Icon name="X" size={20} color={COLORS.midnight} />
            </Pressable>
          </View>

          <Text className="mb-3 text-base font-bold text-ui-ink">
            What was not a fit?
          </Text>
          <View className="mb-5 flex-row flex-wrap gap-2">
            {REJECTION_REASONS.map((option) => {
              const selected = reason === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    triggerSelectionHaptic();
                    setReason(option.value);
                    setError("");
                  }}
                  disabled={submitting}
                  className={`min-h-11 justify-center rounded-full border px-4 py-2.5 active:opacity-75 ${
                    selected
                      ? "border-ui-forest bg-ui-forest"
                      : "border-ui-parchment bg-ui-paper"
                  }`}
                  accessibilityRole="radio"
                  accessibilityState={{
                    checked: selected,
                    disabled: submitting,
                  }}
                >
                  <Text
                    className={`text-sm font-semibold ${selected ? "text-ui-paper" : "text-ui-midnight"}`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextAreaInput
            label="Anything else?"
            value={feedback}
            action={(value) => {
              setFeedback(value.slice(0, 500));
              setError("");
            }}
            placeholder="Optional feedback"
            helperText={`${feedback.length}/500 · Shared only with Lumore`}
            isDisabled={submitting}
          />

          {error ? (
            <Text
              className="mt-3 text-sm font-semibold text-ui-danger"
              accessibilityRole="alert"
            >
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={() => void submit()}
            disabled={submitting}
            className={`mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-danger px-5 py-3 active:opacity-80 ${submitting ? "opacity-50" : ""}`}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${name} from Explore`}
            accessibilityState={{ disabled: submitting }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.paper} />
            ) : (
              <Icon name="UserRoundX" size={19} color={COLORS.paper} />
            )}
            <Text className="font-bold text-ui-paper">
              {submitting ? "Removing..." : "Remove from Explore"}
            </Text>
          </Pressable>
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};

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
            {profile.interests.slice(0, 3).map((interest) => {
              const option = interestOptions.find(
                (item) => item.value === interest,
              );
              return (
                <View
                  key={interest}
                  className="flex-row items-center gap-2 rounded-full bg-ui-forest/5 px-3.5 py-2.5"
                >
                  <OptionIcon
                    icon={option?.icon}
                    size={15}
                    color={COLORS.forest}
                  />
                  <Text className="text-sm font-bold capitalize text-ui-forest">
                    {option?.label || interest}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.matchNote} className="flex-row items-stretch rounded-[22px] bg-ui-surface-page">
          <View className="items-center justify-center border-r border-ui-parchment pr-4">
            <Icon name="Sparkles" size={28} color={COLORS.aubergine} />
          </View>
          <View className="flex-1">
            <Text className="mt-1 text-[15px] leading-6 text-ui-midnight">
              {matchNote}
            </Text>
          </View>
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

const CreditPill = ({ credits }: { credits?: number }) => (
  <Pressable
    onPress={() => router.push("/(subpage)/credits")}
    accessibilityRole="button"
    accessibilityLabel="View your credits"
    className="min-h-12 flex-row items-center gap-2 rounded-full bg-ui-champagne px-4 py-3 active:opacity-85"
  >
    <Icon name="Coins" size={18} color={COLORS.ink} />
    <Text className="font-bold text-ui-ink">{credits ?? "..."}</Text>
  </Pressable>
);

export default function ExploreScreen() {
  const explore = useDailyExplore();
  const { data: balance } = useQuery({
    queryKey: ["credits", "balance", explore.userId],
    queryFn: fetchCreditsBalance,
    enabled: explore.enabled,
  });
  const data = explore.data;
  const generating = explore.isUnlocking || data?.status === "generating";
  const errorAction = getExploreErrorAction(explore.error);
  const profiles = data?.status === "ready" ? data.profiles : [];
  const forceRefreshCost = data?.refreshCost ?? 10;
  const resetLabel = data?.resetAt
    ? new Date(data.resetAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";
  const { sayHello, rejectProfile, openingProfileId, rejectingProfileId } =
    explore;
  const confirmForceRefresh = () => {
    if (explore.isRefreshingList) return;
    const currentCredits = balance?.data?.credits;
    const affordabilityNote =
      typeof currentCredits === "number" && currentCredits < forceRefreshCost
        ? ` You currently have ${currentCredits} credits, so you will need to earn more before refreshing.`
        : "";
    Alert.alert(
      "Refresh today's suggestions?",
      `This will cost ${forceRefreshCost} credits and replace the current list with a new set of profiles. Your existing chats and rejected profiles will not be affected.${affordabilityNote}`,
      [
        { text: "Keep current list", style: "cancel" },
        {
          text: `Refresh for ${forceRefreshCost} credits`,
          onPress: explore.refreshToday,
        },
      ],
    );
  };
  const renderProfile = useCallback(
    ({ item }: { item: ExploreProfile }) => (
      <ProfileCard
        profile={item}
        onHello={sayHello}
        onReject={rejectProfile}
        opening={openingProfileId === item._id}
        rejecting={rejectingProfileId === item._id}
        disabled={Boolean(openingProfileId || rejectingProfileId)}
      />
    ),
    [openingProfileId, rejectProfile, rejectingProfileId, sayHello],
  );

  const handleError = () => {
    if (errorAction === "credits") router.push("/(subpage)/earn-credits");
    else if (errorAction === "profile") router.push("/(subpage)/edit-profile");
    else if (errorAction === "preferences")
      router.push("/(subpage)/edit-preference");
    else if (errorAction === "login") router.push("/login");
    else void explore.refresh();
  };
  const errorButton = {
    credits: "Earn credits",
    profile: "Complete profile",
    preferences: "Edit preferences",
    login: "Sign in",
    retry: "Try again",
  }[errorAction];
  const refreshControl = (
    <RefreshControl
      refreshing={explore.isRefreshing && !generating}
      onRefresh={() => {
        void explore.refresh();
      }}
      tintColor={COLORS.forest}
      colors={[COLORS.forest]}
    />
  );
  const errorNotice = explore.error ? (
    <View
      className="gap-3 rounded-[22px] border border-ui-danger/20 bg-ui-paper/95 p-4"
      accessibilityLiveRegion="polite"
    >
      <View className="flex-row items-start gap-3">
        <Icon name="CircleAlert" size={18} color={COLORS.danger} />
        <Text className="flex-1 text-sm font-semibold leading-5 text-ui-danger">
          {toUserFacingError(
            explore.error,
            "We could not load your suggestions. Please try again.",
          )}
        </Text>
      </View>
      <Button
        text={errorButton}
        variant="secondary"
        onClick={handleError}
        disabled={explore.isRefreshing}
      />
    </View>
  ) : null;

  if (data?.status === "ready" && profiles.length > 0) {
    return (
      <View className="flex-1 bg-ui-paper">
        <LogoPrefrence />
        <FlatList
          data={profiles}
          keyExtractor={keyExtractor}
          renderItem={renderProfile}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          refreshControl={refreshControl}
          ListHeaderComponent={
            <View className="gap-4 pb-5 pt-5">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text
                    className="font-display text-[30px] leading-9 text-ui-midnight"
                    accessibilityRole="header"
                  >
                    Daily Explore
                  </Text>
                  <Text className="mt-1 text-[15px] leading-6 text-ui-slate">
                    {profiles.length}{" "}
                    {profiles.length === 1 ? "connection" : "connections"} to
                    explore
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={confirmForceRefresh}
                    disabled={explore.isRefreshingList}
                    className={`h-11 w-11 items-center justify-center rounded-full border border-ui-parchment bg-ui-surface-page active:opacity-70 ${explore.isRefreshingList ? "opacity-50" : ""}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Refresh suggestions for ${forceRefreshCost} credits`}
                    accessibilityHint="Replaces today's Explore suggestions with a new set"
                    accessibilityState={{
                      disabled:
                        explore.isRefreshingList,
                    }}
                  >
                    {explore.isRefreshingList ? (
                      <ActivityIndicator size="small" color={COLORS.forest} />
                    ) : (
                      <Icon name="RefreshCw" size={18} color={COLORS.forest} />
                    )}
                  </Pressable>
                  <CreditPill credits={balance?.data?.credits} />
                </View>
              </View>
              {errorNotice}
              {resetLabel ? (
                <View className="flex-row items-start gap-2 rounded-2xl bg-ui-surface-page px-4 py-3">
                  <Icon name="Clock3" size={17} color={COLORS.slate} />
                  <Text className="flex-1 text-sm leading-5 text-ui-slate">
                    Next refresh at {resetLabel}. Scores show compatibility, not
                    a guarantee.
                  </Text>
                </View>
              ) : null}
            </View>
          }
          ListFooterComponent={
            <Pressable
              onPress={() => router.push("/(subpage)/edit-profile")}
              className="mb-5 mt-1 min-h-16 flex-row items-center justify-between gap-3 rounded-[26px] border border-ui-parchment bg-ui-surface-page p-4 active:opacity-85"
              accessibilityRole="button"
              accessibilityLabel="Complete and verify your profile for better results"
              accessibilityHint="Opens profile editing"
            >
              <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest/10">
                <Icon name="BadgeCheck" size={18} color={COLORS.forest} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-ui-ink">
                  Complete and verify your profile
                </Text>
                <Text className="mt-0.5 text-xs leading-4 text-ui-slate">
                  Verified details and better prompts lead to better results.
                </Text>
              </View>
              <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest">
                <Icon name="ArrowRight" size={17} color={COLORS.paper} />
              </View>
            </Pressable>
          }
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ui-surface-page">
      <LogoPrefrence />
      <View className="flex-1 p-3">
        <View className="relative flex-1 overflow-hidden rounded-[24px] bg-ui-midnight">
          <Image
            source={DISCOVERY_BACKGROUND}
            contentFit="cover"
            accessible={false}
            style={StyleSheet.absoluteFillObject}
          />
          <View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: COLORS.midnight, opacity: 0.5 },
            ]}
          />
          <ScrollView
            contentContainerStyle={styles.discoveryContent}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}
          >
            <View className="items-end">
              {explore.userId ? (
                <CreditPill credits={balance?.data?.credits} />
              ) : null}
            </View>

            <View className="flex-1 justify-end gap-4 pt-16">
              <View className="items-center">
                <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-ui-porcelain">
                  <Image
                    source={BOUQUET_IMAGE}
                    style={styles.bouquet}
                    contentFit="contain"
                    accessible={false}
                  />
                </View>

                {!explore.userId ? (
                  <>
                    <HeroTitle>Your Explore starts here</HeroTitle>
                    <HeroCopy>
                      Sign in to see connections chosen around your profile and
                      preferences.
                    </HeroCopy>
                  </>
                ) : explore.isLoading ? (
                  <>
                    <ActivityIndicator
                      className="mt-5"
                      size="large"
                      color={COLORS.champagne}
                    />
                    <HeroTitle compact>Getting Explore ready</HeroTitle>
                    <HeroCopy>Loading today&apos;s possibilities.</HeroCopy>
                  </>
                ) : generating ? (
                  <>
                    <ActivityIndicator
                      className="mt-5"
                      size="large"
                      color={COLORS.champagne}
                    />
                    <HeroTitle compact>
                      Finding your kind of connection
                    </HeroTitle>
                    <HeroCopy>
                      Your suggestions are on their way. You can come back in a
                      moment.
                    </HeroCopy>
                  </>
                ) : data?.status === "empty" ||
                  (data?.status === "ready" && profiles.length === 0) ? (
                  <>
                    <HeroTitle>More possibilities tomorrow</HeroTitle>
                    <HeroCopy>
                      {data?.status === "empty"
                        ? "No profiles fit your preferences today. No credits were spent."
                        : "Today's suggestions are no longer available. Check back after the next refresh."}
                    </HeroCopy>
                  </>
                ) : explore.error && !data ? (
                  <>
                    <HeroTitle>Explore paused for a moment</HeroTitle>
                    <HeroCopy>
                      We could not load today&apos;s suggestions.
                    </HeroCopy>
                  </>
                ) : (
                  <>
                    <HeroTitle>Meet someone new</HeroTitle>
                    <HeroCopy>
                      Explore up to 10 profiles chosen around your preferences,
                      distance, and what you&apos;re looking for.
                    </HeroCopy>
                  </>
                )}
              </View>

              {errorNotice}

              {!explore.userId ? (
                <Button
                  text="Sign in to explore"
                  onClick={() => router.push("/login")}
                />
              ) : data?.status === "locked" ? (
                <>
                  <Button
                    text="Start exploring"
                    onClick={explore.unlockToday}
                    disabled={explore.isUnlocking || explore.isRefreshing}
                    className="bg-ui-forest"
                    accessibilityLabel={`Start exploring for ${data.cost} ${data.cost === 1 ? "credit" : "credits"}`}
                  />
                </>
              ) : data?.status === "empty" ||
                (data?.status === "ready" && profiles.length === 0) ? (
                <Button
                  variant="secondary"
                  text="Review preferences"
                  onClick={() => router.push("/(subpage)/edit-preference")}
                />
              ) : null}

              {data?.status === "locked" ? (
                <Pressable
                  onPress={() => router.push("/(subpage)/edit-profile")}
                  className="min-h-16 flex-row items-center justify-between gap-3 rounded-[26px] bg-ui-paper p-4 active:opacity-85"
                  accessibilityRole="button"
                  accessibilityLabel="Complete your profile for better suggestions"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest/10">
                    <Icon
                      name="BadgeCheck"
                      size={18}
                      color={COLORS.forest}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-ui-ink">
                      Complete your profile
                    </Text>
                    <Text className="mt-0.5 text-xs leading-4 text-ui-slate">
                      Better prompts and photos lead to better suggestions.
                    </Text>
                  </View>
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest">
                    <Icon name="ArrowRight" size={17} color={COLORS.paper} />
                  </View>
                </Pressable>
              ) : null}

              {resetLabel && data?.status !== "locked" ? (
                <Text className="text-center text-xs leading-4 text-ui-paper/70">
                  Next refresh at {resetLabel}.
                </Text>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const HeroTitle = ({
  children,
  compact = false,
}: {
  children: React.ReactNode;
  compact?: boolean;
}) => (
  <Text
    className={`${compact ? "text-3xl leading-9" : "text-4xl leading-10"} mt-4 text-center font-semibold text-ui-paper`}
    accessibilityRole="header"
  >
    {children}
  </Text>
);

const HeroCopy = ({ children }: { children: React.ReactNode }) => (
  <Text className="mt-2 max-w-80 text-center text-sm leading-5 text-ui-paper/80">
    {children}
  </Text>
);

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  discoveryContent: { flexGrow: 1, padding: 16 },
  avatar: { width: "100%", height: "100%" },
  profileCard: {
    marginBottom: 20,
    padding: 16,
    flexShrink: 0,
  },
  profileHeader: {
    columnGap: 16,
  },
  avatarFrame: {
    width: 104,
    height: 116,
    flexShrink: 0,
    position: "relative",
  },
  avatarClip: {
    width: 104,
    height: 116,
    overflow: "hidden",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  profileDetails: {
    rowGap: 10,
    paddingTop: 4,
  },
  cardBody: {
    rowGap: 16,
  },
  matchNote: {
    columnGap: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  bouquet: { width: 48, height: 48 },
});
