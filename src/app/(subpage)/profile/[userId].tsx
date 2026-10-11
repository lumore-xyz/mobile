import SubPageBack from "@/src/components/headers/SubPageBack";
import { useUser } from "@/src/hooks/useUser";
import ProfileScreen from "@/src/screens/Profile";
import invalidateProfileScreenQueries from "@/src/features/profile/invalidateProfileScreenQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { View } from "react-native";

const UserProfile = () => {
  const params = useLocalSearchParams<{ userId?: string }>();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const targetUserId = params.userId;
  const { user } = useUser(targetUserId || "");
  const profileTitle = user?.nickname ? `${user.nickname}'s Profile` : "User Profile";

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await invalidateProfileScreenQueries(queryClient, targetUserId || "");
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, targetUserId]);

  return (
    <View className="flex-1 justify-start items-center bg-ui-paper">
      <SubPageBack title={profileTitle} />
      <ProfileScreen
        profileUserId={targetUserId}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

export default UserProfile;
