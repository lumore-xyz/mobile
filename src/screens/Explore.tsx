import MatchMaking from "@/src/components/explore/MatchMaking";
import LogoPrefrence from "@/src/components/headers/LogoPrefrence";
import { useQuery } from "@tanstack/react-query";
import { ImageBackground, Text, View } from "react-native";
import { fetchPreferenceMatchCount } from "../libs/apis";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
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
    <View className="flex-1 items-center justify-start bg-ui-surface-page">
      <LogoPrefrence />
      <View className="w-full flex-1 items-center justify-center bg-ui-surface-page p-3">
        <ImageBackground
          source={require("@/assets/images/login-screen.webp")}
          resizeMode="cover"
          className="relative w-full flex-1 items-center justify-between overflow-hidden rounded-2xl bg-cover bg-center"
        >
          <View className="z-10 w-full px-4 pt-4">
            <View className="flex-row items-start justify-end gap-3">
              <View className="items-end gap-2">
                <View className="flex-row items-center gap-2 rounded-full bg-ui-primary px-3 py-2">
                  <Icon name="UsersRound" size={15} color={COLORS.shade} />
                  <Text className="text-sm font-black text-ui-shade">
                    {formatNumber(availableUsersCount)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <MatchMaking />
        </ImageBackground>
      </View>
    </View>
  );
}
