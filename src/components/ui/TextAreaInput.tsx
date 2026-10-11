import FormField from "@/src/components/ui/FormField";
import type { TextInputProps } from "@/src/components/ui/TextInput";
import { Textarea, TextareaInput } from "@/src/components/ui/textarea";
import React from "react";

export default function TextAreaInput({
  value,
  action,
  isInvalid,
  isDisabled,
  isReadOnly,
  isRequired,
  label,
  placeholder,
  helperText,
  errorText,
}: TextInputProps) {
  return (
    <FormField
      label={label}
      helperText={helperText}
      errorText={errorText}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
    >
      <Textarea size="md" className="mt-2 h-40 w-full bg-ui-paper">
        <TextareaInput
          nativeID={label}
          className="text-ui-ink placeholder:text-ui-slate"
          onChangeText={(text) => action(text)}
          value={value}
          placeholder={placeholder}
        />
      </Textarea>
    </FormField>
  );
}
