import { useAd } from "@/src/hooks/useAd";
import Icon from "@/src/libs/Icon";
import { useExploreChat } from "@/src/service/context/ExploreChatContext";
import { useOneSignal } from "@/src/service/providers/OneSignalProvider";
import { getIsOnboarded, getUser } from "@/src/service/storage";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import AnimatedDots from "../ui/AnimatedDots";
import Button from "../ui/Button";

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
    const user = getUser();
    const isOnboarded = getIsOnboarded(user?._id);
    if (isOnboarded) {
      router.push("/edit-profile");
      return;
    }

    router.push("/onboarding");
  }, []);

  return (
    <View className="flex w-full items-center justify-center gap-2 p-3">
      <View className="flex h-20 w-20 aspect-square items-center justify-center rounded-full border border-ui-shade/10 bg-ui-light/70">
        <Icon name="Flower2" className="text-ui-shade/60" size={40} />
      </View>
      <Text className="text-center text-4xl font-bold text-ui-light/90">
        {isMatching ? <AnimatedDots text="Searching" /> : "Meet Someone New"}
      </Text>
      <Text className="max-w-80 text-center text-ui-light/70">
        {isMatching
          ? "We're searching for your perfect match! As we're newly launched, it might take a moment to connect you with someone special. Hang tight we'll notify you as soon as we find them."
          : "Discover real connection around you, effortlessly, and authentically"}
      </Text>
      {error ? <Text className="text-sm text-red-500">{error}</Text> : null}
      <Button
        variant="primary"
        className="mt-4 flex w-full items-center rounded-2xl border border-ui-shade/30 bg-ui-highlight px-6 py-4"
        onClick={isMatching ? stopMatchmaking : handleStartMatchmaking}
        disabled={!isMatching && isStarting}
        text={isMatching ? "Stop Matchmaking" : "Start Matchmaking"}
      />
      <View className="z-10 w-full">
        <Pressable
          onPress={handleRedirection}
          className="flex-row items-center justify-between rounded-xl border border-ui-shade/10 bg-[#E9E3EF] p-3"
        >
          <Text className="flex-1 pr-3 font-medium text-ui-highlight">
            Complete your profile for better experience ❤️‍🔥
          </Text>

          <View className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-ui-highlight">
            <Icon
              name="ArrowRight"
              color="#FAFAFA"
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default React.memo(MatchMaking);
