import { router } from "expo-router";
import React from "react";
import { Image, Pressable, View } from "react-native";

import Icon from "@/src/libs/Icon";
import NotificationBell from "../notifications/NotificationBell";
import LUMORE_WORDMARK from "@/assets/images/lumore-hr.png";

const LogoPrefrence = () => {
  return (
    <View className="h-16 bg-ui-paper flex flex-row items-center justify-between gap-3 w-full px-4">
      <View className="">
        <Image
          source={LUMORE_WORDMARK}
          accessibilityLabel="Lumore"
          resizeMode="contain"
          className="h-12 w-28"
        />
      </View>
      <View className="flex-row items-center gap-1">
        <NotificationBell />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit preferences"
          onPress={() => router.navigate("/(subpage)/edit-preference")}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
          hitSlop={8}
        >
          <Icon
            name="SlidersHorizontal"
            className="text-ui-ink"
            size={24}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default React.memo(LogoPrefrence);
