import { router } from "expo-router";
import React from "react";
import { Image, Pressable, View } from "react-native";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import LUMORE_WORDMARK from "@/assets/images/lumore-hr.webp";

const LogoPrefrenceSetting = () => {
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
      <View className="flex flex-row items-center justify-end gap-4">
        <Pressable
          onPress={() => {
            triggerSelectionHaptic();
            router.navigate("/(subpage)/edit-preference");
          }}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Edit preferences"
        >
          <Icon
            name="SlidersHorizontal"
            className="text-ui-ink"
            size={24}
          />
        </Pressable>
        <Pressable
          onPress={() => {
            triggerSelectionHaptic();
            router.navigate("/(subpage)/settings");
          }}
          className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Icon
            name="Settings"
            className="text-ui-ink"
            size={24}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default React.memo(LogoPrefrenceSetting);
