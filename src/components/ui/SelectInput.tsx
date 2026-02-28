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
import { AlertCircleIcon, ChevronDownIcon } from "@/src/components/ui/icon";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/src/components/ui/select";
import { SelectOption } from "./MultiSelectInput";
import React, { useMemo } from "react";

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
  const selectedOption = useMemo(
    () => options?.find((option) => option.value === value),
    [options, value]
  );

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

      <Select onValueChange={action} selectedValue={value}>
        <SelectTrigger
          size="lg"
          className={`rounded-xl border px-1 ${
            isInvalid ? "border-red-500" : "border-ui-shade/20"
          }`}
        >
          <SelectInput
            placeholder={selectedOption?.label || placeholder}
            className={`flex-1 text-base ${
              selectedOption ? "text-ui-dark" : "text-ui-shade/70"
            }`}
          />
          <SelectIcon
            className={`mr-2 ${
              isInvalid ? "text-red-500" : "text-ui-highlight"
            }`}
            as={ChevronDownIcon}
          />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent className="px-3 pb-4 pt-2">
            <SelectDragIndicatorWrapper className="mb-3">
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {options?.map((option) => (
              <SelectItem
                className="rounded-lg px-3 py-2"
                key={option.value}
                label={option.label}
                value={option.value}
              />
            ))}
          </SelectContent>
        </SelectPortal>
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
export default SelectInputUI;
