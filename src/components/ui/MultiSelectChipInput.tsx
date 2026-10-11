import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import OptionIcon from "@/src/libs/OptionIcon";
import type { SelectOption } from "@/src/libs/optionsCatalog";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";

type MultiSelectChipOption = SelectOption;
const MAX_SEARCH_RESULTS = 40;
const SEARCHABLE_OPTIONS_THRESHOLD = 30;

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
  const [searchText, setSearchText] = useState("");
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
  const isSearchable = options.length > SEARCHABLE_OPTIONS_THRESHOLD;
  const normalizedSearch = searchText.trim().toLocaleLowerCase();
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValueSet.has(option.value)),
    [options, selectedValueSet],
  );
  const matchingOptions = useMemo(
    () =>
      normalizedSearch
        ? options.filter(
            (option) =>
              option.label.toLocaleLowerCase().includes(normalizedSearch) ||
              option.value.toLocaleLowerCase().includes(normalizedSearch),
          )
        : [],
    [normalizedSearch, options],
  );
  const visibleOptions = useMemo(() => {
    if (!isSearchable) return options;
    if (!normalizedSearch) return selectedOptions;

    const selectedOptionValues = new Set(selectedOptions.map(({ value }) => value));
    return [
      ...selectedOptions,
      ...matchingOptions
        .filter((option) => !selectedOptionValues.has(option.value))
        .slice(0, MAX_SEARCH_RESULTS),
    ];
  }, [isSearchable, matchingOptions, normalizedSearch, options, selectedOptions]);

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
      className={`rounded-[24px] border bg-ui-surface-page p-4 ${errorText ? "border-ui-danger" : "border-ui-parchment"}`}
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="flex-1">
          <Text className="text-lg font-bold text-ui-ink">{label}</Text>
          {placeholder ? (
            <Text className="mt-1 text-sm leading-5 text-ui-slate">
              {placeholder}
            </Text>
          ) : null}
        </View>
        {multiple && max ? (
          <Text className="rounded-full bg-ui-forest/10 px-3 py-1 text-xs font-semibold text-ui-forest">
            {selectedValues.length}/{max}
          </Text>
        ) : null}
      </View>

      {isSearchable ? (
        <View className="mt-3 h-11 flex-row items-center rounded-2xl border border-ui-parchment bg-ui-paper px-3">
          <Icon name="Search" size={17} color={COLORS.slate} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search options"
            placeholderTextColor={COLORS.slate}
            className="ml-2 min-w-0 flex-1 text-sm text-ui-ink"
            returnKeyType="search"
            accessibilityLabel={`Search ${label.toLowerCase()} options`}
          />
          {searchText ? (
            <Pressable
              onPress={() => setSearchText("")}
              className="h-8 w-8 items-center justify-center rounded-full"
              accessibilityRole="button"
              accessibilityLabel="Clear option search"
            >
              <Icon name="X" size={15} color={COLORS.slate} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <ScrollView
        className={isSearchable ? "mt-2" : "mt-3"}
        style={{ maxHeight }}
        nestedScrollEnabled
        scrollEnabled={options.length > 0}
        showsVerticalScrollIndicator={options.length > 4}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-row flex-wrap gap-2">
          {options.length && visibleOptions.length ? (
            visibleOptions.map((option) => {
              const isSelected = selectedValueSet.has(option.value);
              const isDisabled = Boolean(multiple && !isSelected && maxReached);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggleOption(option.value)}
                  disabled={isDisabled}
                  className={`min-h-11 flex-row items-center justify-center gap-2 rounded-full border px-3.5 py-2.5 ${
                    isSelected
                      ? "border-ui-forest bg-ui-forest"
                      : "border-ui-parchment bg-ui-paper"
                  } ${isDisabled ? "opacity-45" : ""} self-start`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${isSelected ? "Selected" : "Select"} ${option.label}`}
                >
                  <OptionIcon icon={option.icon} size={14} />
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? "font-semibold text-ui-paper"
                        : "font-medium text-ui-ink"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {isSelected ? (
                    <Icon name="Check" size={14} color={COLORS.paper} />
                  ) : null}
                </Pressable>
              );
            })
          ) : options.length ? (
            <Text className="text-sm text-ui-slate">
              {normalizedSearch
                ? "No matching options. Try another search."
                : "Search above to find an option."}
            </Text>
          ) : (
            <Text className="text-sm text-ui-slate">{placeholder}</Text>
          )}
        </View>
      </ScrollView>
      {normalizedSearch && matchingOptions.length > MAX_SEARCH_RESULTS ? (
        <Text className="mt-2 text-xs text-ui-slate">
          Showing the first {MAX_SEARCH_RESULTS} matches. Refine your search to see more.
        </Text>
      ) : null}

      {helperText && !errorText ? (
        <Text className="mt-3 text-sm leading-5 text-ui-slate">{helperText}</Text>
      ) : null}
      {errorText ? (
        <Text className="mt-3 text-sm font-medium text-ui-danger">
          {errorText}
        </Text>
      ) : null}
    </View>
  );
};

export default React.memo(MultiSelectChipInput);
