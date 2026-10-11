import React from "react";
import { Pressable, Text, View } from "react-native";

export interface ChoiceChipOption {
  label: string;
  value: string;
}

interface ChoiceChipGroupProps {
  options: readonly ChoiceChipOption[];
  value: string;
  onValueChange: (value: string) => void;
  size?: "compact" | "comfortable";
  isDisabled?: boolean;
}

export default function ChoiceChipGroup({
  options,
  value,
  onValueChange,
  size = "comfortable",
  isDisabled = false,
}: ChoiceChipGroupProps) {
  const isCompact = size === "compact";

  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => onValueChange(option.value)}
            disabled={isDisabled}
            className={`justify-center rounded-full border active:opacity-75 ${
              isCompact ? "px-3 py-2" : "min-h-11 px-4 py-2.5"
            } ${
              selected
                ? "border-ui-forest bg-ui-forest"
                : isCompact
                  ? "border-ui-ink/20 bg-ui-paper"
                  : "border-ui-parchment bg-ui-paper"
            } ${isDisabled ? "opacity-50" : ""}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected, disabled: isDisabled }}
          >
            <Text
              className={`${
                isCompact ? "text-xs" : "text-sm font-semibold"
              } ${
                selected
                  ? "text-ui-paper"
                  : isCompact
                    ? "text-ui-ink"
                    : "text-ui-midnight"
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
