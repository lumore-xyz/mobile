import MatchMaking from "@/src/components/explore/MatchMaking";
import LogoPrefrence from "@/src/components/headers/LogoPrefrence";
import { useQuery } from "@tanstack/react-query";
import { ImageBackground, Text, View } from "react-native";
import { fetchPreferenceMatchCount } from "../libs/apis";
import { PREFERENCE_MATCH_COUNT_QUERY_KEY } from "../service/query-keys";
import { formatNumber } from "../utils";

export default function ExploreScreen() {
  const { data: availableUsersCount = 0 } = useQuery({
    queryKey: PREFERENCE_MATCH_COUNT_QUERY_KEY,
    queryFn: async () => {
      const response = await fetchPreferenceMatchCount();
      return response?.success ? response.data?.availableUsers || 0 : 0;
    },
  });

  return (
    <View className="flex-1 justify-start items-center bg-ui-light">
      <LogoPrefrence />
      <View className="flex-1 justify-center items-center w-full bg-ui-light p-3">
        <ImageBackground
          source={require("@/assets/images/login-screen.webp")}
          resizeMode="cover"
          className="relative flex-1 justify-end items-center bg-cover bg-center overflow-hidden w-full rounded-3xl"
        >
          <View className="absolute top-0 right-0 z-10 flex w-full items-end justify-center p-4">
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
