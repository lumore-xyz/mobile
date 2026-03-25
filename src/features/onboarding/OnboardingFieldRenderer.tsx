import DateInput from "@/src/components/ui/DateInput";
import MultiSelectChipInput from "@/src/components/ui/MultiSelectChipInput";
import RangeInput from "@/src/components/ui/RangeInput";
import SingleSlider from "@/src/components/ui/SliderInput";
import { TextInput } from "@/src/components/ui/TextInput";
import { View } from "react-native";
import type { Field } from "./types";

interface OnboardingFieldRendererProps {
  field: Field;
  value: unknown;
  errorText?: string;
  onChange: (name: string, value: unknown) => void;
}

const OnboardingFieldRenderer = ({
  field,
  value,
  errorText,
  onChange,
}: OnboardingFieldRendererProps) => {
  const defaultRangeValue = Array.isArray(field.defaultValue)
    ? field.defaultValue
    : [field.min || 18, field.max || 50];
  const defaultSliderValue =
    typeof field.defaultValue === "number"
      ? field.defaultValue
      : (field.min ?? 10);

  // console.log({ field, value });
  if (field.type === "date") {
    return (
      <DateInput
        label={field.label}
        date={value ? new Date(String(value)) : undefined}
        onChange={(date) => onChange(field.name, date.toISOString())}
        helperText={field.helperText}
        errorText={errorText}
        min={field.min}
        max={field.max}
      />
    );
  }

  if (field.type === "select") {
    return (
      <MultiSelectChipInput
        label={field.label}
        options={field.options || []}
        value={(value as string) || ""}
        multiple={false}
        onChange={(option) => onChange(field.name, option)}
        placeholder={field.placeholder}
        helperText={field.helperText}
        errorText={errorText}
      />
    );
  }

  if (field.type === "multiselect") {
    return (
      <MultiSelectChipInput
        label={field.label}
        options={field.options || []}
        value={(value as string[]) || []}
        multiple
        max={field.max || 5}
        onChange={(options) => onChange(field.name, options)}
        placeholder={field.placeholder}
        helperText={field.helperText}
        errorText={errorText}
      />
    );
  }

  if (field.type === "range") {
    return (
      <RangeInput
        label={field.label}
        value={(value as number[]) || defaultRangeValue}
        onChange={(range) => onChange(field.name, range)}
        min={field.min || 18}
        max={field.max || 50}
        step={field.step || 1}
        unit={field.unit}
        helperText={field.helperText}
        errorText={errorText}
      />
    );
  }

  if (field.type === "slider") {
    return (
      <SingleSlider
        label={field.label}
        min={field.min || 1}
        max={field.max || 100}
        step={field.step}
        value={Number(value ?? defaultSliderValue)}
        unit={field.unit}
        onChange={(nextValue) => onChange(field.name, nextValue)}
        helperText={field.helperText}
        errorText={errorText}
      />
    );
  }

  return (
    <View>
      <TextInput
        value={(value as string) || ""}
        action={(text) => onChange(field.name, text)}
        label={field.label}
        type={field.type === "password" ? "password" : "text"}
        placeholder={field.placeholder}
        helperText={field.helperText}
        errorText={errorText}
        isInvalid={Boolean(errorText)}
      />
    </View>
  );
};

export default OnboardingFieldRenderer;
