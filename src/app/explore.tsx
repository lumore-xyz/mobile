import MobileNav from "@/src/components/MobileNav";
import ExploreScreen from "@/src/screens/Explore";
import { PREFERENCE_MATCH_COUNT_QUERY_KEY } from "@/src/service/query-keys";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";

const Explore = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: PREFERENCE_MATCH_COUNT_QUERY_KEY,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return (
    <View className="flex-1 bg-ui-light">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        alwaysBounceVertical
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="#541388"
            colors={["#541388"]}
          />
        }
      >
        <ExploreScreen />
      </ScrollView>
      <MobileNav />
    </View>
  );
};

export default Explore;
