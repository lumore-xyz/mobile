import { router } from "expo-router";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";

const LUMORE_WORDMARK = require("@/assets/images/lumore-hr.png");

const LogoPrefrenceSetting = () => {
  return (
    <View className="h-16 bg-ui-light flex flex-row items-center justify-between gap-3 w-full px-4">
      <View className="">
        <Image source={LUMORE_WORDMARK} alt="Lumore" className="h-12 w-28" />
      </View>
      <View className="flex flex-row items-center justify-end gap-4">
        <TouchableOpacity
          onPress={() => {
            triggerSelectionHaptic();
            router.navigate("/(subpage)/edit-preference");
          }}
          className="h-11 w-11 items-center justify-center rounded-full"
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Edit preferences"
        >
          <Icon
            name="SlidersHorizontal"
            className="text-ui-shade"
            size={24}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            triggerSelectionHaptic();
            router.navigate("/(subpage)/settings");
          }}
          className="h-11 w-11 items-center justify-center rounded-full"
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Icon
            name="Settings"
            className="text-ui-shade"
            size={24}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(LogoPrefrenceSetting);
