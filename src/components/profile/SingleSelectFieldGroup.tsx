import MultiSelectChipInput from "@/src/components/ui/MultiSelectChipInput";
import type { SelectOption } from "@/src/libs/optionsCatalog";
import React from "react";
import { View } from "react-native";

interface SingleSelectField {
  key: string;
  label: string;
  placeholder: string;
  helperText?: string;
  options?: SelectOption[];
}

interface SingleSelectFieldGroupProps {
  fields: SingleSelectField[];
  options: SelectOption[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  className?: string;
}

const SingleSelectFieldGroup: React.FC<SingleSelectFieldGroupProps> = ({
  fields,
  options,
  values,
  onChange,
  className = "gap-4",
}) => (
  <View className={className}>
    {fields.map(({ key, label, placeholder, helperText, options: fieldOptions }) => (
      <MultiSelectChipInput
        key={key}
        label={label}
        options={fieldOptions ?? options}
        placeholder={placeholder}
        value={values[key] || ""}
        onChange={(value) => onChange(key, Array.isArray(value) ? value[0] || "" : value)}
        multiple={false}
        helperText={helperText}
      />
    ))}
  </View>
);

export default SingleSelectFieldGroup;
