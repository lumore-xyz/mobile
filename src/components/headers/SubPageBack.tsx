import { Href, router } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
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
    <View className="h-16 bg-ui-paper flex flex-row items-center justify-start gap-3 w-full px-4">
      <Pressable
        onPress={handleBack}
        className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
        hitSlop={4}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Icon
          name="ArrowLeft"
          className="text-ui-ink"
          size={24}
        />
      </Pressable>

      <View>
        <Text className="font-display text-xl text-ui-ink">{title}</Text>
      </View>
    </View>
  );
};

export default React.memo(SubPageBack);
