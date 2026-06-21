import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "@/src/components/ui/form-control";
import { AlertCircleIcon, CheckIcon, ChevronDownIcon } from "@/src/components/ui/icon";
import {
  Select,
  SelectTrigger,
} from "@/src/components/ui/select";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
  ActionsheetItemText,
} from "@/src/components/ui/actionsheet";
import OptionIcon from "@/src/libs/OptionIcon";
import { SelectOption } from "./MultiSelectInput";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { triggerSelectionHaptic } from "@/src/utils/haptics";

interface SelectInputUIProps {
  value: string;
  action: (value: string) => void;
  isInvalid?: boolean;
  label?: string;
  options?: SelectOption[];
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}

const SelectInputUI: React.FC<SelectInputUIProps> = ({
  label,
  placeholder,
  options,
  value,
  action,
  helperText,
  errorText,
  isRequired,
  isInvalid,
  isReadOnly,
  isDisabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = useMemo(
    () => options?.find((option) => option.value === value),
    [options, value],
  );

  const handleOpen = useCallback(() => {
    if (isDisabled || isReadOnly) return;
    triggerSelectionHaptic();
    setIsOpen(true);
  }, [isDisabled, isReadOnly]);

  const handleSelect = useCallback(
    (nextValue: string) => {
      triggerSelectionHaptic();
      action(nextValue);
      setIsOpen(false);
    },
    [action],
  );

  const selectedIconColor = isInvalid ? "#EF4444" : "#541388";

  return (
    <FormControl
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      isInvalid={isInvalid}
      size="lg"
      className="w-full"
    >
      {label ? (
        <FormControlLabel className="mb-1">
          <FormControlLabelText className="text-typography-900">
            {label}
          </FormControlLabelText>
        </FormControlLabel>
      ) : null}

      <Select
        selectedValue={value}
        onValueChange={action}
        isDisabled={isDisabled}
      >
        <SelectTrigger
          size="lg"
          className={`rounded-lg border px-3 ${
            isInvalid ? "border-red-500" : "border-ui-shade/20"
          }`}
        >
          <Pressable
            onPress={handleOpen}
            disabled={isDisabled || isReadOnly}
            accessibilityRole="button"
            className="flex-1 flex-row items-center gap-2"
            style={{ minHeight: 24 }}
          >
            {selectedOption?.icon ? (
              <OptionIcon
                icon={selectedOption.icon}
                size={18}
                color={selectedIconColor}
              />
            ) : null}
            <Text
              className={`flex-1 text-base ${
                selectedOption ? "text-ui-dark" : "text-ui-shade/70"
              }`}
              numberOfLines={1}
            >
              {selectedOption?.label || placeholder}
            </Text>
            <ChevronDownIcon
              className={`${isInvalid ? "text-red-500" : "text-ui-highlight"}`}
            />
          </Pressable>
        </SelectTrigger>

        <Actionsheet isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <ActionsheetBackdrop />
          <ActionsheetContent className="px-3 pb-4 pt-2">
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>

            <View className="w-full pb-2">
              {options?.map((option) => {
                const isSelected = option.value === value;
                return (
                  <ActionsheetItem
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    className="rounded-lg px-4 py-4"
                  >
                    <View className="flex-1 flex-row items-center gap-3">
                      <View
                        className={`h-9 w-9 items-center justify-center rounded-full ${
                          isSelected ? "bg-ui-highlight/15" : "bg-ui-shade/5"
                        }`}
                      >
                        <OptionIcon
                          icon={option.icon}
                          size={18}
                          color={isSelected ? "#541388" : "#111827"}
                        />
                      </View>
                      <ActionsheetItemText
                        className={`flex-1 text-lg ${
                          isSelected
                            ? "font-semibold text-ui-highlight"
                            : "text-ui-dark"
                        }`}
                      >
                        {option.label}
                      </ActionsheetItemText>
                    </View>
                    {isSelected ? (
                      <View className="ml-2 h-6 w-6 items-center justify-center rounded-full bg-ui-highlight">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </View>
                    ) : null}
                  </ActionsheetItem>
                );
              })}
              {!options?.length ? (
                <Text className="py-6 text-center text-ui-shade/70">
                  No options available
                </Text>
              ) : null}
            </View>
          </ActionsheetContent>
        </Actionsheet>
      </Select>

      {helperText ? (
        <FormControlHelper className="mt-1">
          <FormControlHelperText className="text-ui-shade/80">
            {helperText}
          </FormControlHelperText>
        </FormControlHelper>
      ) : null}
      {errorText ? (
        <FormControlError className="mt-1">
          <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
          <FormControlErrorText className="text-red-500">
            {errorText}
          </FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
};

export default React.memo(SelectInputUI);
