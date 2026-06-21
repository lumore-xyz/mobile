import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";

import NotificationBell from "../notifications/NotificationBell";

const LUMORE_WORDMARK = require("@/assets/images/lumore-hr.png");

const LogoPrefrence = () => {
  return (
    <View className="h-16 bg-ui-light flex flex-row items-center justify-between gap-3 w-full px-4">
      <View className="">
        <Image source={LUMORE_WORDMARK} alt="Lumore" className="h-12 w-28" />
      </View>
      <View className="flex-row items-center gap-1">
        <NotificationBell />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Edit preferences"
          onPress={() => router.navigate("/(subpage)/edit-preference")}
          className="h-11 w-11 items-center justify-center rounded-full"
          hitSlop={8}
        >
          <Ionicons
            name="options-outline"
            className="text-ui-shade"
            size={24}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(LogoPrefrence);
