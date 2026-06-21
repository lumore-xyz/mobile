import React from "react";
import { ActivityIndicator, Pressable, Text } from "react-native";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";

interface GoogleAuthButtonProps {
  text?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onPress: () => void;
}

export const GoogleAuthButton = React.memo(function GoogleAuthButton({
  text = "Continue with Google",
  disabled = false,
  isLoading = false,
  onPress,
}: GoogleAuthButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={() => {
        triggerSelectionHaptic();
        onPress();
      }}
      disabled={isDisabled}
      className={`min-h-12 flex-row items-center justify-center gap-3 rounded-md border border-ui-shade/15 bg-white px-4 py-3 ${
        isDisabled ? "opacity-60" : ""
      }`}
      android_ripple={{ color: "rgba(84,19,136,0.06)", borderless: false }}
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#541388" />
      ) : (
        <Icon name="LogIn" size={18} color="#541388" />
      )}
      <Text className="text-sm font-semibold text-ui-shade">{text}</Text>
    </Pressable>
  );
});
