import React, { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export interface MultiSelectChipOption {
  label: string;
  value: string;
}

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

const CHIP_PALETTES = [
  {
    idle: "bg-rose-50 border-rose-200 text-rose-700",
    active: "bg-rose-200 border-rose-300 text-rose-900",
  },
  {
    idle: "bg-amber-50 border-amber-200 text-amber-700",
    active: "bg-amber-200 border-amber-300 text-amber-900",
  },
  {
    idle: "bg-lime-50 border-lime-200 text-lime-700",
    active: "bg-lime-200 border-lime-300 text-lime-900",
  },
  {
    idle: "bg-emerald-50 border-emerald-200 text-emerald-700",
    active: "bg-emerald-200 border-emerald-300 text-emerald-900",
  },
  {
    idle: "bg-cyan-50 border-cyan-200 text-cyan-700",
    active: "bg-cyan-200 border-cyan-300 text-cyan-900",
  },
  {
    idle: "bg-sky-50 border-sky-200 text-sky-700",
    active: "bg-sky-200 border-sky-300 text-sky-900",
  },
  {
    idle: "bg-violet-50 border-violet-200 text-violet-700",
    active: "bg-violet-200 border-violet-300 text-violet-900",
  },
  {
    idle: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700",
    active: "bg-fuchsia-200 border-fuchsia-300 text-fuchsia-900",
  },
];

const hashText = (text: string) => {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getPaletteForText = (text: string) =>
  CHIP_PALETTES[hashText(text) % CHIP_PALETTES.length];

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

  const toggleOption = (optionValue: string) => {
    const isSelected = selectedValues.includes(optionValue);

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
  };

  return (
    <View
      className={`rounded-xl border p-3 ${errorText ? "border-red-500" : "border-ui-shade/10"}`}
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text className="font-medium text-typography-900 text-xl">{label}</Text>
        {multiple && max ? (
          <Text className="text-xs text-ui-shade/70">
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
              const isSelected = selectedValues.includes(option.value);
              const isDisabled = Boolean(multiple && !isSelected && maxReached);
              const palette = getPaletteForText(option.label || option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggleOption(option.value)}
                  disabled={isDisabled}
                  className={`rounded-full border px-3 py-2 ${
                    isSelected ? palette.active : palette.idle
                  } ${isDisabled ? "opacity-45" : ""} self-start`}
                >
                  <Text
                    className={`text-xs ${isSelected ? "font-semibold" : "font-medium"}`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })
          ) : (
            <Text className="text-sm text-ui-shade/60">{placeholder}</Text>
          )}
        </View>
      </ScrollView>

      {helperText && !errorText ? (
        <Text className="text-sm text-ui-shade/70 mt-2">{helperText}</Text>
      ) : null}
      {errorText ? (
        <Text className="text-red-500 mt-2">{errorText}</Text>
      ) : null}
    </View>
  );
};

export default MultiSelectChipInput;
