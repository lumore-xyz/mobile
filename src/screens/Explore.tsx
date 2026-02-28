import MatchMaking from "@/src/components/explore/MatchMaking";
import LogoPrefrence from "@/src/components/headers/LogoPrefrence";
import { useEffect, useState } from "react";
import { ImageBackground, Text, View } from "react-native";
import { fetchAppStatus } from "../libs/apis";
import { formatNumber } from "../utils";

interface APP_STATUS {
  totalUsers: number;
  activeUsers: number;
  isMatching: number;
  inactiveUsers: number;
  genderDistribution: { women: number; men: number; others: number };
}

export default function ExploreScreen() {
  const [appStatus, setappStatus] = useState<APP_STATUS | null>(null);

  useEffect(() => {
    const _fetchAppStatus = async () => {
      const appStatus = await fetchAppStatus();
      if (appStatus.success) {
        setappStatus(appStatus.data);
      }
    };

    _fetchAppStatus();
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
                {formatNumber(appStatus?.isMatching || 0)} Active Users
              </Text>
            </View>
          </View>
          <MatchMaking />
        </ImageBackground>
      </View>
    </View>
  );
}

