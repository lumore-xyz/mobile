import MobileNav from "@/src/components/MobileNav";
import ProfileScreen from "@/src/screens/Profile";
import React from "react";
import LogoPrefrenceSetting from "../components/headers/LogoPrefrenceSetting";

const Profile = () => {
  return (
    <>
      <LogoPrefrenceSetting />
      <ProfileScreen />
      <MobileNav />
    </>
  );
};

export default Profile;
