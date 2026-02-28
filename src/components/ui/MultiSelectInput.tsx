import React, { useMemo, useState } from "react";
import {
  FlatList,
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

  // ✅ FIX: Ensure value is always an array
  const safeValue = useMemo(() => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    // If it's a string or other type, return empty array
    console.warn(`MultiSelectInput received non-array value:`, value);
    return [];
  }, [value]);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  const handleSelect = (selectedValue: string) => {
    // if it's already selected -> remove
    if (safeValue.includes(selectedValue)) {
      onChange(safeValue.filter((val) => val !== selectedValue));
      return;
    }

    // enforce max limit
    if (max && safeValue.length >= max) return;

    onChange([...safeValue, selectedValue]);
  };

  // ✅ Function to remove a specific item
  const removeItem = (itemValue: string, event?: any) => {
    // Prevent the parent Pressable from opening the modal
    if (event) {
      event.stopPropagation();
    }
    onChange(safeValue.filter((val) => val !== itemValue));
  };

  return (
    <View className="mb-4">
      {/* Label */}
      <Text className="font-medium text-typography-900 text-xl mb-2">
        {label}
      </Text>

      {/* Dropdown trigger */}
      <Pressable
        onPress={() => setIsOpen(true)}
        className="border border-gray-300 rounded-xl p-4"
      >
        {safeValue.length === 0 ? (
          <Text className="text-gray-400">{placeholder}</Text>
        ) : (
          <View className="flex flex-row flex-wrap gap-2">
            {safeValue.map((val) => {
              const item = options.find((opt) => opt.value === val);
              return (
                <TouchableOpacity
                  key={val}
                  onPress={(e) => removeItem(val, e)}
                  className="bg-ui-highlight/10 !rounded-full px-3 py-1 flex-row items-center gap-1"
                >
                  <Text className="text-ui-highlight">{item?.label}</Text>
                  {/* ✅ X icon to indicate it's removable */}
                  <Text className="text-ui-highlight font-bold ml-1">×</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </Pressable>

      {/* ✅ Helper text showing count and limit */}
      {max && safeValue.length > 0 && (
        <Text className="text-sm text-gray-500 mt-1">
          {safeValue.length} / {max} selected
        </Text>
      )}

      <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="max-h-[90%] min-h-[70%]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          {/* ✅ Search Input */}
          <View className="w-full mt-6">
            <TextInput
              label="Search"
              placeholder="Search..."
              value={search}
              action={setSearch}
            />
          </View>

          {/* Options List */}
          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item.value}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item.value)}
                className={`flex flex-row items-center justify-between py-2 w-full rounded-lg px-1 ${
                  index % 2 === 0 ? "bg-white" : "bg-ui-background/40"
                }`}
              >
                <Text className="text-lg max-w-[80%]">{item.label}</Text>
                <View
                  className={`rounded-full w-5 h-5 border border-black ${
                    safeValue.includes(item.value) ? "bg-black" : "bg-white"
                  }`}
                />
              </TouchableOpacity>
            )}
          />
        </ActionsheetContent>
      </Actionsheet>

      {/* Helper/Error messages */}
      {helperText && !errorText ? (
        <Text className="text-xl text-typography-500 mt-1">{helperText}</Text>
      ) : null}

      {errorText ? (
        <Text className="text-red-500 mt-1">{errorText}</Text>
      ) : null}
    </View>
  );
};

export default MultiSelectInput;
