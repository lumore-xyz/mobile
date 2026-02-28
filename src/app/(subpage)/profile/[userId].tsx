import ProfileScreen from "@/src/screens/Profile";
import { useLocalSearchParams } from "expo-router";
import React from "react";

const UserProfile = () => {
  const params = useLocalSearchParams<{ userId?: string }>();
  return <ProfileScreen profileUserId={params.userId} />;
};

export default UserProfile;
