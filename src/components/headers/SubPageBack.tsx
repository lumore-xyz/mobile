import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const SubPageBack = ({
  title,
  fallbackHref,
}: {
  title: string;
  fallbackHref?: Href;
}) => {
  const handleBack = () => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }

    if (fallbackHref) {
      router.replace(fallbackHref);
    }
  };

  return (
    <View className="h-16 bg-ui-light flex flex-row items-center justify-start gap-3 w-full px-4">
      <TouchableOpacity onPress={handleBack} hitSlop={8}>
        <MaterialCommunityIcons
          name="keyboard-backspace"
          className="text-ui-shade"
          size={24}
        />
      </TouchableOpacity>

      <View>
        <Text className="text-ui-shade font-medium text-lg">{title}</Text>
      </View>
    </View>
  );
};

export default SubPageBack;
