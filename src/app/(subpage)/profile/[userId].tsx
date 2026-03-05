import SubPageBack from "@/src/components/headers/SubPageBack";
import ProfileScreen from "@/src/screens/Profile";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

const UserProfile = () => {
  const params = useLocalSearchParams<{ userId?: string }>();
  return (
    <View className="flex-1 justify-start items-center bg-ui-light">
      <SubPageBack title="Match Profile" />
      <ProfileScreen profileUserId={params.userId} />
    </View>
  );
};

export default UserProfile;
