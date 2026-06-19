import SubPageBack from "@/src/components/headers/SubPageBack";
import ProfileScreen from "@/src/screens/Profile";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { View } from "react-native";

const UserProfile = () => {
  const params = useLocalSearchParams<{ userId?: string }>();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const targetUserId = params.userId;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user", targetUserId] }),
        queryClient.invalidateQueries({
          queryKey: ["user posts", targetUserId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["user-profile", targetUserId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["this-or-that", "answers", targetUserId],
        }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, targetUserId]);

  return (
    <View className="flex-1 justify-start items-center bg-ui-light">
      <SubPageBack title="Match Profile" />
      <ProfileScreen
        profileUserId={targetUserId}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

export default UserProfile;
