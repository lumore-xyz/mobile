import MobileNav from "@/src/components/MobileNav";
import ProfileScreen from "@/src/screens/Profile";
import { getUser } from "@/src/service/storage";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import LogoPrefrenceSetting from "../components/headers/LogoPrefrenceSetting";

const Profile = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentUser = getUser();
  const currentUserId = currentUser?._id;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user", currentUserId] }),
        queryClient.invalidateQueries({
          queryKey: ["user posts", currentUserId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["user-profile", currentUserId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["this-or-that", "answers", currentUserId],
        }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, currentUserId]);

  return (
    <>
      <LogoPrefrenceSetting />
      <ProfileScreen isRefreshing={isRefreshing} onRefresh={handleRefresh} />
      <MobileNav />
    </>
  );
};

export default Profile;
