import React, { useCallback, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import OptionIcon from "@/src/libs/OptionIcon";
import type { SelectOption } from "@/src/libs/options";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";

export type MultiSelectChipOption = SelectOption;

interface MultiSelectChipInputProps {
  label: string;
  options: MultiSelectChipOption[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  max?: number;
  maxHeight?: number;
  multiple?: boolean;
  helperText?: string;
  errorText?: string;
}

const MultiSelectChipInput: React.FC<MultiSelectChipInputProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select options",
  max,
  maxHeight = 220,
  multiple = false,
  helperText,
  errorText,
}) => {
  const selectedValues: string[] = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return typeof value === "string" && value ? [value] : [];
  }, [multiple, value]);

  const maxReached = Boolean(multiple && max && selectedValues.length >= max);
  const selectedValueSet = useMemo(
    () => new Set(selectedValues),
    [selectedValues],
  );

  const toggleOption = useCallback(
    (optionValue: string) => {
      triggerSelectionHaptic();
      const isSelected = selectedValueSet.has(optionValue);

      if (multiple && isSelected) {
        onChange(selectedValues.filter((item) => item !== optionValue));
        return;
      }

      if (multiple) {
        if (maxReached) return;
        onChange([...selectedValues, optionValue]);
        return;
      }

      onChange(optionValue);
    },
    [maxReached, multiple, onChange, selectedValueSet, selectedValues],
  );

  return (
    <View
      className={`rounded-[24px] border bg-ui-surface-page p-4 ${errorText ? "border-red-500" : "border-ui-border"}`}
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-ui-shade">{label}</Text>
          {placeholder ? (
            <Text className="mt-1 text-sm leading-5 text-ui-muted">
              {placeholder}
            </Text>
          ) : null}
        </View>
        {multiple && max ? (
          <Text className="rounded-full bg-ui-highlight/10 px-3 py-1 text-xs font-semibold text-ui-highlight">
            {selectedValues.length}/{max}
          </Text>
        ) : null}
      </View>

      <ScrollView
        className="mt-3"
        style={{ maxHeight }}
        nestedScrollEnabled
        scrollEnabled={options.length > 0}
        showsVerticalScrollIndicator={options.length > 4}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row flex-wrap gap-2">
          {options.length ? (
            options.map((option) => {
              const isSelected = selectedValueSet.has(option.value);
              const isDisabled = Boolean(multiple && !isSelected && maxReached);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggleOption(option.value)}
                  disabled={isDisabled}
                  className={`min-h-11 flex-row items-center justify-center gap-2 rounded-full border px-3.5 py-2.5 ${
                    isSelected
                      ? "border-ui-highlight bg-ui-highlight"
                      : "border-ui-border bg-ui-light"
                  } ${isDisabled ? "opacity-45" : ""} self-start`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${isSelected ? "Selected" : "Select"} ${option.label}`}
                >
                  <OptionIcon icon={option.icon} size={14} />
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? "font-semibold text-ui-light"
                        : "font-medium text-ui-shade"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <Icon name="Check" size={14} color={COLORS.light} />
                  ) : null}
                </Pressable>
              );
            })
          ) : (
            <Text className="text-sm text-ui-muted">{placeholder}</Text>
          )}
        </View>
      </ScrollView>

      {helperText && !errorText ? (
        <Text className="mt-3 text-sm leading-5 text-ui-muted">{helperText}</Text>
      ) : null}
      {errorText ? (
        <Text className="mt-3 text-sm font-medium text-red-500">
          {errorText}
        </Text>
      ) : null}
    </View>
  );
};

export default React.memo(MultiSelectChipInput);
