import MatchMaking from "@/src/components/explore/MatchMaking";
import LogoPrefrence from "@/src/components/headers/LogoPrefrence";
import { useEffect, useState } from "react";
import { ImageBackground, Text, View } from "react-native";
import { fetchPreferenceMatchCount } from "../libs/apis";
import { formatNumber } from "../utils";

export default function ExploreScreen() {
  const [availableUsersCount, setAvailableUsersCount] = useState(0);

  useEffect(() => {
    const fetchMatchCount = async () => {
      const response = await fetchPreferenceMatchCount();
      if (response?.success) {
        setAvailableUsersCount(response.data?.availableUsers || 0);
      }
    };

    void fetchMatchCount();
  }, []);

  return (
    <View className="flex-1 justify-start items-center bg-ui-light">
      <LogoPrefrence />
      <View className="flex-1 justify-center items-center w-full bg-ui-light p-3">
        <View className=" bg-ui-background"></View>
        <ImageBackground
          source={require("@/assets/images/login-screen.webp")}
          className="relative flex-1 justify-end items-center bg-cover bg-center overflow-hidden w-full rounded-3xl"
        >
          <View className="absolute top-0 right-0 w-full z-10 flex items-end justify-center p-4 w-full">
            <View className="bg-ui-light/30 rounded-full space-x-1 px-3 py-1">
              <Text className="text-ui-light">
                {formatNumber(availableUsersCount)} Users
              </Text>
            </View>
          </View>
          <MatchMaking />
        </ImageBackground>
      </View>
    </View>
  );
}

