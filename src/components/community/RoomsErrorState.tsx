import Button from "@/src/components/ui/Button";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";

export default function RoomsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="mt-1 items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8" accessibilityLiveRegion="polite">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-danger/5">
        <Icon name="CloudOff" size={24} color={COLORS.danger} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-ink">
        Communities are taking a moment
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
        We could not load communities. Check your connection and try again.
      </Text>
      <Button text="Try again" onClick={onRetry} className="mt-5 px-6" />
    </View>
  );
}
