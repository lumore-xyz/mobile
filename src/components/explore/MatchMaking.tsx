import Icon from "@/src/libs/Icon";
import { useAd } from "@/src/hooks/useAd";
import { useExploreChat } from "@/src/service/context/ExploreChatContext";
import { getIsOnboarded, getUser } from "@/src/service/storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
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
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    revalidateUser();
  }, [revalidateUser]);

  const handleStartMatchmaking = async () => {
    if (isStarting || isMatching) return;

    setIsStarting(true);
    try {
      await showRewarded();
      startMatchmaking();
    } finally {
      setIsStarting(false);
    }
  };

  const handleRedirection = () => {
    const user = getUser();
    const isOnborded = getIsOnboarded(user?._id);
    if (isOnborded) {
      // redirect to edit profile
      router.push("/edit-profile");
    } else {
      // redirect to onboarding
      router.push("/onboarding");
    }
  };
  return (
    <View className="w-full flex justify-center items-center gap-2 p-3">
      <View className=" bg-ui-light/70 border border-ui-shade/10 h-20 w-20 aspect-square rounded-full flex items-center justify-center">
        <Ionicons
          name={isMatching ? "rose-outline" : "rose-outline"}
          className="text-ui-shade/60"
          size={40}
        />
      </View>
      <Text className="text-4xl text-ui-light/90 font-bold text-center">
        {isMatching ? <AnimatedDots text="Searching" /> : "Meet Someone New"}
      </Text>
      <Text className="text-center text-ui-light/70 max-w-80">
        {isMatching
          ? "We're searching for your perfect match! As we're newly launched, it might take a moment to connect you with someone special. Hang tight we'll notify you as soon as we find them."
          : "Discover real connection around you, effortlessly, and authentically"}
      </Text>
      {error && <Text className="text-red-500 text-sm">{error}</Text>}
      <Button
        variant="primary"
        className="bg-ui-highlight w-full py-6 px-6 flex items-center rounded-2xl border border-ui-shade/30 mt-4"
        onClick={isMatching ? stopMatchmaking : handleStartMatchmaking}
        disabled={!isMatching && isStarting}
        text={isMatching ? "Stop Matchmaking" : "Start Matchmaking"}
      />
      <View className="z-10 w-full">
        <Pressable
          onPress={handleRedirection}
          className="bg-[#E9E3EF] border border-ui-shade/10 rounded-xl p-3 flex-row items-center justify-between"
        >
          <Text className="text-ui-highlight font-medium flex-1 pr-3">
            Complete your profile for better experience ❤️‍🔥
          </Text>

          <View className="flex items-center justify-center bg-ui-highlight rounded-full h-8 w-8 flex-shrink-0">
            <Icon
              type="Ionicons"
              name="arrow-forward-outline"
              color="#FAFAFA"
            />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default MatchMaking;
