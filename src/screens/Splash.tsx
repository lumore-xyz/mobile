import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Image, Text, View, useWindowDimensions } from "react-native";
import { bootstrapAuthSession } from "../service/auth-session";
import { getIsOnboarded, getUser } from "../service/storage";
import LOGO_IMAGE from "@/assets/images/logo.png";

const SplashScreen = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const logoEntrance = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const titleEntrance = useRef(new Animated.Value(0)).current;
  const taglineEntrance = useRef(new Animated.Value(0)).current;

  const tokenCheck = useCallback(async () => {
    const hasValidSession = await bootstrapAuthSession();
    if (!hasValidSession) {
      router.replace("/login");
      return;
    }

    const user = getUser();
    const isOnboarded = getIsOnboarded(user?._id) as boolean;

    if (isOnboarded) {
      router.replace("/explore");
      return;
    }

    router.replace("/(onboarding)/onboarding");
  }, [router]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      void tokenCheck();
    });
    return () => cancelAnimationFrame(frameId);
  }, [tokenCheck]);

  useEffect(() => {
    const entrance = Animated.parallel([
      Animated.timing(logoEntrance, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.timing(titleEntrance, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(taglineEntrance, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]);
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    const rotationAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    );

    entrance.start();
    pulseAnimation.start();
    rotationAnimation.start();

    return () => {
      entrance.stop();
      pulseAnimation.stop();
      rotationAnimation.stop();
    };
  }, [logoEntrance, pulse, rotation, taglineEntrance, titleEntrance]);

  const pulseScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });
  const pulseOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 0.2],
  });
  const rotationDegrees = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="flex-1 items-center justify-center bg-ui-surface-page px-6">
      <Animated.View
        style={{
          width: width * 0.3,
          height: width * 0.3,
          opacity: logoEntrance,
          transform: [
            {
              scale: logoEntrance.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 1],
              }),
            },
          ],
        }}
        className="mb-8 items-center justify-center"
      >
        <Animated.View
          style={{
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          }}
          className="absolute inset-0 rounded-full bg-ui-champagne"
        />

        <Animated.View
          style={{ transform: [{ rotate: rotationDegrees }] }}
          className="absolute inset-2 rounded-xl border-4 border-ui-paper"
        />

        <View className="absolute h-[70%] w-[70%] items-center justify-center rounded-full">
          <Image
            source={LOGO_IMAGE}
            className="h-24 w-24 rounded-full"
            resizeMode="contain"
          />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          opacity: titleEntrance,
          transform: [
            {
              translateY: titleEntrance.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        }}
      >
        <Text className="mb-2 text-center font-display text-3xl text-ui-ink">
          Lumore
        </Text>
      </Animated.View>

      <Animated.View
        style={{
          opacity: taglineEntrance,
          transform: [
            {
              translateY: taglineEntrance.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <Text className="text-center text-xl text-ui-ink/80">
          Connecting you with like-minded people.
        </Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

