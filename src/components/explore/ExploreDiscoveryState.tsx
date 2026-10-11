import Button from "@/src/components/ui/Button";
import CreditPill from "@/src/components/explore/CreditPill";
import ExploreErrorNotice from "@/src/components/explore/ExploreErrorNotice";
import ExploreProfileCompletionCard from "@/src/components/explore/ExploreProfileCompletionCard";
import ExploreHeroCopy from "@/src/components/explore/ExploreHeroCopy";
import ExploreHeroTitle from "@/src/components/explore/ExploreHeroTitle";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import ExploreStyles from "@/src/components/explore/ExploreStyles";
import { DailyExplore } from "@/src/features/explore/api";
import { COLORS } from "@/src/libs/constants/theme";
import formatTime from "@/src/utils/helpers/formatTime";
import { Image } from "expo-image";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BOUQUET_IMAGE from "@/assets/images/bouquet.webp";
import DISCOVERY_BACKGROUND from "@/assets/images/login-screen.webp";

interface ExploreDiscoveryStateProps {
  userId: string;
  data?: DailyExplore;
  error?: unknown;
  isLoading: boolean;
  isUnlocking: boolean;
  isRefreshing: boolean;
  credits?: number;
  errorAction: "login" | "credits" | "profile" | "preferences" | "retry";
  onRefresh: () => void;
  onUnlock: () => void;
  onErrorAction: () => void;
  onSignIn: () => void;
  onEditPreferences: () => void;
  onEditProfile: () => void;
}

export default function ExploreDiscoveryState({
  userId,
  data,
  error,
  isLoading,
  isUnlocking,
  isRefreshing,
  credits,
  errorAction,
  onRefresh,
  onUnlock,
  onErrorAction,
  onSignIn,
  onEditPreferences,
  onEditProfile,
}: ExploreDiscoveryStateProps) {
  const generating = isUnlocking || data?.status === "generating";
  const resetLabel = data?.resetAt ? formatTime(data.resetAt) : "";
  const errorButton = {
    credits: "Earn credits",
    profile: "Complete profile",
    preferences: "Edit preferences",
    login: "Sign in",
    retry: "Try again",
  }[errorAction];

  return (
    <View className="flex-1 bg-ui-surface-page">
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
            contentContainerStyle={ExploreStyles.discoveryContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <LumoreRefreshControl
                refreshing={isRefreshing && !generating}
                onRefresh={onRefresh}
              />
            }
          >
            <View className="items-end">
              {userId ? <CreditPill credits={credits} /> : null}
            </View>

            <View className="flex-1 justify-end gap-4 pt-16">
              <View className="items-center">
                <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-ui-porcelain">
                  <Image
                    source={BOUQUET_IMAGE}
                    style={ExploreStyles.bouquet}
                    contentFit="contain"
                    accessible={false}
                  />
                </View>

                {!userId ? (
                  <>
                    <ExploreHeroTitle>Your Explore starts here</ExploreHeroTitle>
                    <ExploreHeroCopy>
                      Sign in to see connections chosen around your profile and
                      preferences.
                    </ExploreHeroCopy>
                  </>
                ) : isLoading ? (
                  <>
                    <ActivityIndicator
                      className="mt-5"
                      size="large"
                      color={COLORS.champagne}
                    />
                    <ExploreHeroTitle compact>
                      Getting Explore ready
                    </ExploreHeroTitle>
                    <ExploreHeroCopy>
                      Loading today&apos;s possibilities.
                    </ExploreHeroCopy>
                  </>
                ) : generating ? (
                  <>
                    <ActivityIndicator
                      className="mt-5"
                      size="large"
                      color={COLORS.champagne}
                    />
                    <ExploreHeroTitle compact>
                      Finding your kind of connection
                    </ExploreHeroTitle>
                    <ExploreHeroCopy>
                      Your suggestions are on their way. You can come back in a
                      moment.
                    </ExploreHeroCopy>
                  </>
                ) : data?.status === "empty" ||
                  (data?.status === "ready" && data.profiles.length === 0) ? (
                  <>
                    <ExploreHeroTitle>
                      More possibilities tomorrow
                    </ExploreHeroTitle>
                    <ExploreHeroCopy>
                      {data?.status === "empty"
                        ? "No profiles fit your preferences today. No credits were spent."
                        : "Today's suggestions are no longer available. Check back after the next refresh."}
                    </ExploreHeroCopy>
                  </>
                ) : error && !data ? (
                  <>
                    <ExploreHeroTitle>
                      Explore paused for a moment
                    </ExploreHeroTitle>
                    <ExploreHeroCopy>
                      We could not load today&apos;s suggestions.
                    </ExploreHeroCopy>
                  </>
                ) : (
                  <>
                    <ExploreHeroTitle>Meet someone new</ExploreHeroTitle>
                    <ExploreHeroCopy>
                      Explore up to 10 profiles chosen around your preferences,
                      distance, and what you&apos;re looking for.
                    </ExploreHeroCopy>
                  </>
                )}
              </View>

              {error ? (
                <ExploreErrorNotice
                  error={error}
                  actionLabel={errorButton}
                  disabled={isRefreshing}
                  onAction={onErrorAction}
                />
              ) : null}

              {!userId ? (
                <Button text="Sign in to explore" onClick={onSignIn} />
              ) : data?.status === "locked" ? (
                <Button
                  text="Start exploring"
                  onClick={onUnlock}
                  disabled={isUnlocking || isRefreshing}
                  className="bg-ui-forest"
                  accessibilityLabel={`Start exploring for ${data.cost} ${data.cost === 1 ? "credit" : "credits"}`}
                />
              ) : data?.status === "empty" ||
                (data?.status === "ready" && data.profiles.length === 0) ? (
                <Button
                  variant="secondary"
                  text="Review preferences"
                  onClick={onEditPreferences}
                />
              ) : null}

              {data?.status === "locked" ? (
                <ExploreProfileCompletionCard
                  title="Complete your profile"
                  description="Better prompts and photos lead to better suggestions."
                  accessibilityLabel="Complete your profile for better suggestions"
                  accessibilityHint="Opens profile editing"
                  className="min-h-16 flex-row items-center justify-between gap-3 rounded-[26px] bg-ui-paper p-4 active:opacity-85"
                  onPress={onEditProfile}
                />
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
