import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "./actionsheet";
import { TextInput } from "./TextInput";

export interface SelectOption {
  label: string;
  value: string;
}

interface MultiSelectInputProps {
  label: string;
  options: SelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  max?: number;
  helperText?: string;
  errorText?: string;
}

const MultiSelectInput: React.FC<MultiSelectInputProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Select options",
  max,
  helperText,
  errorText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const safeValue = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (__DEV__) {
      console.warn("MultiSelectInput received non-array value:", value);
    }
    return [];
  }, [value]);

  const selectedValueSet = useMemo(() => new Set(safeValue), [safeValue]);

  const optionByValue = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options],
  );

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return options;

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalizedSearch),
    );
  }, [options, search]);

  const handleSelect = useCallback(
    (selectedValue: string) => {
      if (selectedValueSet.has(selectedValue)) {
        onChange(safeValue.filter((itemValue) => itemValue !== selectedValue));
        return;
      }

      if (max && safeValue.length >= max) return;

      onChange([...safeValue, selectedValue]);
    },
    [max, onChange, safeValue, selectedValueSet],
  );

  const removeItem = useCallback(
    (itemValue: string, event?: { stopPropagation?: () => void }) => {
      event?.stopPropagation?.();
      onChange(safeValue.filter((valueItem) => valueItem !== itemValue));
    },
    [onChange, safeValue],
  );

  const renderOption = useCallback<ListRenderItem<SelectOption>>(
    ({ item, index }) => {
      const isSelected = selectedValueSet.has(item.value);

      return (
        <TouchableOpacity
          onPress={() => handleSelect(item.value)}
          className={`flex w-full flex-row items-center justify-between rounded-lg px-1 py-2 ${
            index % 2 === 0 ? "bg-white" : "bg-ui-background/40"
          }`}
        >
          <Text className="max-w-[80%] text-lg">{item.label}</Text>
          <View
            className={`h-5 w-5 rounded-full border border-black ${
              isSelected ? "bg-black" : "bg-white"
            }`}
          />
        </TouchableOpacity>
      );
    },
    [handleSelect, selectedValueSet],
  );

  return (
    <View className="mb-4">
      <Text className="mb-2 text-xl font-medium text-typography-900">
        {label}
      </Text>

      <Pressable
        onPress={() => setIsOpen(true)}
        className="rounded-xl border border-gray-300 p-4"
      >
        {safeValue.length === 0 ? (
          <Text className="text-gray-400">{placeholder}</Text>
        ) : (
          <View className="flex flex-row flex-wrap gap-2">
            {safeValue.map((selectedValue) => {
              const item = optionByValue.get(selectedValue);
              return (
                <TouchableOpacity
                  key={selectedValue}
                  onPress={(event) => removeItem(selectedValue, event)}
                  className="flex-row items-center gap-1 rounded-full bg-ui-highlight/10 px-3 py-1"
                >
                  <Text className="text-ui-highlight">{item?.label}</Text>
                  <Text className="ml-1 font-bold text-ui-highlight">×</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Pressable>

      {max && safeValue.length > 0 ? (
        <Text className="mt-1 text-sm text-gray-500">
          {safeValue.length} / {max} selected
        </Text>
      ) : null}

      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="max-h-[90%] min-h-[70%]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="mt-6 w-full">
            <TextInput
              label="Search"
              placeholder="Search..."
              value={search}
              action={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            renderItem={renderOption}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            initialNumToRender={16}
            maxToRenderPerBatch={16}
            windowSize={8}
            ListEmptyComponent={
              <Text className="py-6 text-center text-ui-shade/70">
                No options found
              </Text>
            }
          />
        </ActionsheetContent>
      </Actionsheet>

      {helperText && !errorText ? (
        <Text className="mt-1 text-xl text-typography-500">{helperText}</Text>
      ) : null}

      {errorText ? (
        <Text className="mt-1 text-red-500">{errorText}</Text>
      ) : null}
    </View>
  );
};

export default React.memo(MultiSelectInput);
