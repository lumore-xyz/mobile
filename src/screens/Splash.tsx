import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { MotiView } from "moti";
import React, { useCallback, useEffect } from "react";
import { Alert, Dimensions, Image, Text, View } from "react-native";
import useAuth from "../service/requests/auth";
import {
  getAccessToken,
  getIsOnboarded,
  getRefreshToken,
  getUser,
} from "../service/storage";

const { width } = Dimensions.get("window");

interface DecodedToken {
  exp: number;
}

const SplashScreen = () => {
  const router = useRouter();
  const { refreshTokens } = useAuth();
  const tokenCheck = useCallback(async () => {
    const accessToken = getAccessToken() as string;
    const refreshToken = getRefreshToken() as string;
    const user = getUser();
    const isOnboarded = getIsOnboarded(user?._id) as boolean;

    if (accessToken) {
      const decodedAccessToken = jwtDecode<DecodedToken>(accessToken);
      const decodedRefreshToken = jwtDecode<DecodedToken>(refreshToken);

      const currentTime = Date.now() / 1000;

      if (decodedRefreshToken?.exp < currentTime) {
        router.replace("/login");
        // resetAndNavigate("login");
        Alert.alert("Session expired please login again");
        return;
      }

      if (decodedAccessToken?.exp < currentTime) {
        const refreshed = await refreshTokens();
        if (!refreshed) {
          Alert.alert("There was a problem");
          return;
        }
      }
      if (isOnboarded) {
        console.log("redirecting to profile page...");
        router.replace("/explore");
        return;
      }
      router.replace("/(onboarding)/onboarding");
      return;
    }
    console.log("redirecting to login page...");
    router.replace("/login");
  }, [refreshTokens, router]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void tokenCheck();
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [tokenCheck]);

  return (
    <View className="flex-1 items-center justify-center bg-[#F1E9DA]">
      {/* Animated Circle Logo */}
      <MotiView
        from={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "timing", duration: 500 }}
        style={{ width: width * 0.3, height: width * 0.3 }}
        className="mb-8 items-center justify-center"
      >
        {/* Pulsing Yellow Background */}
        <MotiView
          from={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0.2, scale: 1.2 }}
          transition={{ loop: true, type: "timing", duration: 1500 }}
          className="absolute inset-0 rounded-full bg-[#FFD400]"
        />

        {/* Rotating Border */}
        <MotiView
          from={{ rotate: "0deg" }}
          animate={{ rotate: "360deg" }}
          transition={{ loop: true, type: "timing", duration: 1500 }}
          className="absolute inset-2 rounded-xl border-4 border-white"
        />

        {/* Centered Logo */}
        <View className="absolute h-[70%] w-[70%] items-center justify-center rounded-full">
          <Image
            source={require("@/assets/images/logo.png")}
            className="h-24 w-24 rounded-full"
            resizeMode="contain"
          />
        </View>
      </MotiView>

      {/* Title */}
      <MotiView
        from={{ translateY: -20, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ delay: 200, type: "timing" }}
      >
        <Text className="mb-2 text-center text-3xl font-bold text-ui-shade">
          Lumore
        </Text>
      </MotiView>

      {/* Subtitle */}
      <MotiView
        from={{ translateY: 20, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ delay: 400, type: "timing" }}
      >
        <Text className="text-center text-xl text-ui-shade/80">
          Connecting you with like-minded people.
        </Text>
      </MotiView>
    </View>
  );
};

export default SplashScreen;

