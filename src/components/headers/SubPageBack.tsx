import { Href, router } from "expo-router";
import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";

const SubPageBack = ({
  title,
  fallbackHref,
}: {
  title: string;
  fallbackHref?: Href;
}) => {
  const handleBack = useCallback(() => {
    triggerSelectionHaptic();
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }

    if (fallbackHref) {
      router.replace(fallbackHref);
    }
  }, [fallbackHref]);

  return (
    <View className="h-16 bg-ui-light flex flex-row items-center justify-start gap-3 w-full px-4">
      <TouchableOpacity
        onPress={handleBack}
        className="h-11 w-11 items-center justify-center rounded-full"
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Icon
          name="ArrowLeft"
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

export default React.memo(SubPageBack);
