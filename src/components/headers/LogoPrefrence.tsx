import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";

const LogoPrefrence = () => {
  return (
    <View className="h-16 bg-ui-light flex flex-row items-center justify-between gap-3 w-full px-4">
      <View className="">
        <Image
          source={require("@/assets/images/lumore-hr.png")}
          alt="Lumore"
          className="h-12 w-28"
        />
      </View>
      <View>
        <TouchableOpacity
          onPress={() => router.navigate("/(subpage)/edit-preference")}
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

export default LogoPrefrence;
