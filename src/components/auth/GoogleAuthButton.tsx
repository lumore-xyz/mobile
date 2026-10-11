import React from "react";
import { ActivityIndicator, Image, Pressable, Text } from "react-native";
import GOOGLE_LOGO from "@/assets/images/google.webp";
import { THEME } from "@/src/libs/constants/theme";
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
      className={`min-h-12 flex-row items-center justify-center gap-3 rounded-full border border-ui-parchment bg-ui-surface-raised px-4 py-3 active:opacity-80 ${
        isDisabled ? "opacity-60" : ""
      }`}
      accessibilityRole="button"
      accessibilityLabel={text}
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={THEME.action.premium} />
      ) : (
        <Image
          source={GOOGLE_LOGO}
          className="h-5 w-5"
          resizeMode="contain"
          accessibilityIgnoresInvertColors
        />
      )}
      <Text className="text-sm font-semibold text-ui-ink">{text}</Text>
    </Pressable>
  );
});
