import LogoPrefrence from "@/src/components/headers/LogoPrefrence";
import { ExploreProfile } from "@/src/features/explore/api";
import getExploreErrorAction from "@/src/features/explore/getExploreErrorAction";
import formatTime from "@/src/utils/helpers/formatTime";
import { useDailyExplore } from "@/src/features/explore/useDailyExplore";
import ProfileCard from "@/src/components/explore/ProfileCard";
import CreditPill from "@/src/components/explore/CreditPill";
import ExploreDiscoveryState from "@/src/components/explore/ExploreDiscoveryState";
import ExploreErrorNotice from "@/src/components/explore/ExploreErrorNotice";
import ExploreProfileCompletionCard from "@/src/components/explore/ExploreProfileCompletionCard";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import styles from "@/src/components/explore/ExploreStyles";
import useCreditsBalance from "@/src/features/credits/useCreditsBalance";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { router } from "expo-router";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

const keyExtractor = (profile: ExploreProfile) => profile._id;



export default function ExploreScreen() {
  const explore = useDailyExplore();
  const { data: balance } = useCreditsBalance(explore.userId, explore.enabled);
  const data = explore.data;
  const generating = explore.isUnlocking || data?.status === "generating";
  const errorAction = getExploreErrorAction(explore.error);
  const profiles = data?.status === "ready" ? data.profiles : [];
  const forceRefreshCost = data?.refreshCost ?? 10;
  const resetLabel = data?.resetAt ? formatTime(data.resetAt) : "";
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
          refreshControl={
            <LumoreRefreshControl
              refreshing={explore.isRefreshing && !generating}
              onRefresh={() => void explore.refresh()}
            />
          }
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
              {explore.error ? (
                <ExploreErrorNotice
                  error={explore.error}
                  actionLabel={errorButton}
                  disabled={explore.isRefreshing}
                  onAction={handleError}
                />
              ) : null}
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
            <ExploreProfileCompletionCard
              title="Complete and verify your profile"
              description="Verified details and better prompts lead to better results."
              accessibilityLabel="Complete and verify your profile for better results"
              accessibilityHint="Opens profile editing"
              className="mb-5 mt-1 min-h-16 flex-row items-center justify-between gap-3 rounded-[26px] border border-ui-parchment bg-ui-surface-page p-4 active:opacity-85"
              onPress={() => router.push("/(subpage)/edit-profile")}
            />
          }
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ui-paper">
      <LogoPrefrence />
      <ExploreDiscoveryState
        userId={explore.userId}
        data={data}
        error={explore.error}
        isLoading={explore.isLoading}
        isUnlocking={explore.isUnlocking}
        isRefreshing={explore.isRefreshing}
        credits={balance?.data?.credits}
        errorAction={errorAction}
        onRefresh={() => void explore.refresh()}
        onUnlock={explore.unlockToday}
        onErrorAction={handleError}
        onSignIn={() => router.push("/login")}
        onEditPreferences={() => router.push("/(subpage)/edit-preference")}
        onEditProfile={() => router.push("/(subpage)/edit-profile")}
      />
    </View>
  );
}

