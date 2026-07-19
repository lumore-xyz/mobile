import { useAd } from "@/src/hooks/useAd";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { useExploreChat } from "@/src/service/context/ExploreChatContext";
import { useOneSignal } from "@/src/service/providers/OneSignalProvider";
import { getIsOnboarded, getUser } from "@/src/service/storage";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, Linking, Pressable, Text, View } from "react-native";
import AnimatedDots from "../ui/AnimatedDots";
import Button from "../ui/Button";

const BOUQUET_IMAGE = require("@/assets/images/bouquet.png");

const MatchMaking = () => {
  const {
    isMatching,
    error,
    startMatchmaking,
    stopMatchmaking,
    revalidateUser,
  } = useExploreChat();
  const { showRewarded } = useAd();
  const { checkNotificationPermission } = useOneSignal();
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    revalidateUser();
  }, [revalidateUser]);

  const ensureRequiredPermissions = useCallback(async () => {
    const missing: string[] = [];

    try {
      const locationPermission = await Location.getForegroundPermissionsAsync();
      if (locationPermission.status !== "granted") {
        missing.push("Location");
      }
    } catch {
      missing.push("Location");
    }

    let notificationGranted = false;
    try {
      notificationGranted = await checkNotificationPermission(false);
    } catch {
      notificationGranted = false;
    }

    if (!notificationGranted) {
      missing.push("Notification");
    }

    if (missing.length === 0) return true;

    Alert.alert(
      "Permissions required",
      `Please enable ${missing.join(
        " and ",
      )} permission${missing.length > 1 ? "s" : ""} to start matchmaking.`,
      [
        { text: "Not now", style: "cancel" },
        {
          text: "Open Settings",
          onPress: () => {
            void Linking.openSettings();
          },
        },
      ],
    );
    return false;
  }, [checkNotificationPermission]);

  const handleStartMatchmaking = useCallback(async () => {
    if (isStarting || isMatching) return;

    const hasRequiredPermissions = await ensureRequiredPermissions();
    if (!hasRequiredPermissions) return;

    setIsStarting(true);
    try {
      await showRewarded();
      startMatchmaking();
    } finally {
      setIsStarting(false);
    }
  }, [
    ensureRequiredPermissions,
    isMatching,
    isStarting,
    showRewarded,
    startMatchmaking,
  ]);

  const handleRedirection = useCallback(() => {
    triggerSelectionHaptic();
    const user = getUser();
    const isOnboarded = getIsOnboarded(user?._id);
    if (isOnboarded) {
      router.push("/edit-profile");
      return;
    }

    router.push("/onboarding");
  }, []);

  return (
    <View className="z-10 w-full justify-end gap-3 p-4">
      <View className="">
        <View className="items-center">
          <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-ui-background">
            <Image
              source={BOUQUET_IMAGE}
              className="h-12 w-12"
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>
          <Text className="mt-4 text-center text-4xl font-black leading-10 text-ui-light">
            {isMatching ? (
              <AnimatedDots text="Searching" />
            ) : (
              "Meet someone new"
            )}
          </Text>
          <Text className="mt-2 max-w-80 text-center text-sm leading-5 text-ui-light/80">
            {isMatching
              ? "We are looking for someone who fits your preferences. Keep the app nearby — we will notify you when a match opens."
              : "Start a guided search for people nearby who fit your preferences and are open to a real conversation."}
          </Text>
        </View>

        {/* <View className="mt-5 flex-row gap-2">
          <SignalPill icon="MapPin" label="Nearby" />
          <SignalPill icon="BellRing" label="Notified" />
          <SignalPill icon="ShieldCheck" label="Preference-led" />
        </View> */}

        {error ? (
          <View className="mt-4 flex-row items-start gap-3 rounded-[22px] border border-ui-danger/20 bg-ui-danger/10 p-3">
            <Icon name="CircleAlert" size={18} color={COLORS.danger} />
            <Text className="flex-1 text-sm font-semibold leading-5 text-ui-danger">
              {error}
            </Text>
          </View>
        ) : null}

        <Button
          variant="primary"
          className="mt-5 w-full bg-ui-highlight px-6 py-4"
          onClick={isMatching ? stopMatchmaking : handleStartMatchmaking}
          disabled={!isMatching && isStarting}
          text={isMatching ? "Stop search" : "Start matchmaking"}
          accessibilityLabel={
            isMatching ? "Stop matchmaking search" : "Start matchmaking search"
          }
        />
      </View>

      <View className="w-full">
        <Pressable
          onPress={handleRedirection}
          className="min-h-16 flex-row items-center justify-between gap-3 rounded-[26px] bg-ui-light p-4 active:opacity-85"
          accessibilityRole="button"
          accessibilityLabel="Complete your profile for better matches"
        >
          <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-highlight/10">
            <Icon name="BadgeCheck" size={18} color={COLORS.highlight} />
          </View>
          <View className="flex-1">
            <Text className="font-black text-ui-shade">
              Complete your profile
            </Text>
            <Text className="mt-0.5 text-xs leading-4 text-ui-muted">
              Better prompts and photos help matches say something real.
            </Text>
          </View>

          <View className="h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-ui-highlight">
            <Icon name="ArrowRight" size={17} color={COLORS.light} />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

// const SignalPill = ({ icon, label }: { icon: string; label: string }) => (
//   <View className="flex-1 items-center gap-1 rounded-2xl bg-ui-surface-page px-2 py-3">
//     <Icon name={icon} size={16} color={COLORS.highlight} />
//     <Text className="text-center text-[11px] font-bold text-ui-muted">
//       {label}
//     </Text>
//   </View>
// );

export default React.memo(MatchMaking);
