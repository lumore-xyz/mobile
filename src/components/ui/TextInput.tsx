import FormField from "./FormField";
import { EyeIcon, EyeOffIcon } from "./icon";
import { Input, InputField, InputIcon, InputSlot } from "./input";
import { useState } from "react";
import type { TextInputProps as NativeTextInputProps } from "react-native";

export interface TextInputProps {
  value: string;
  action: (value: string) => void;
  isInvalid?: boolean;
  label: string;
  type?: "text" | "password";
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  autoCapitalize?: NativeTextInputProps["autoCapitalize"];
  autoComplete?: NativeTextInputProps["autoComplete"];
  autoCorrect?: NativeTextInputProps["autoCorrect"];
  keyboardType?: NativeTextInputProps["keyboardType"];
  returnKeyType?: NativeTextInputProps["returnKeyType"];
  textContentType?: NativeTextInputProps["textContentType"];
  onSubmitEditing?: NativeTextInputProps["onSubmitEditing"];
  compact?: boolean;
  labelTextClassName?: string;
}
export const TextInput: React.FC<TextInputProps> = ({
  value,
  action,
  isInvalid,
  isDisabled,
  isReadOnly,
  isRequired,
  label,
  type = "text",
  placeholder,
  helperText,
  errorText,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  keyboardType,
  returnKeyType,
  textContentType,
  onSubmitEditing,
  compact,
  labelTextClassName,
}) => {
  const isPasswordField = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormField
      label={label}
      helperText={helperText}
      errorText={errorText}
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      compact={compact}
      labelTextClassName={labelTextClassName}
    >
      <Input className={`${compact ? "mt-0" : "mt-2"} bg-ui-paper`} size="lg">
        <InputField
          type={isPasswordField && showPassword ? "text" : type}
          placeholder={placeholder}
          className="text-ui-ink placeholder:text-ui-slate"
          nativeID={label}
          value={value}
          onChangeText={(text) => action(text)}
          autoCapitalize={
            autoCapitalize ?? (isPasswordField ? "none" : "sentences")
          }
          autoComplete={autoComplete}
          autoCorrect={autoCorrect ?? !isPasswordField}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          textContentType={textContentType}
          onSubmitEditing={onSubmitEditing}
        />
        {isPasswordField ? (
          <InputSlot
            className="px-3"
            onPress={() => setShowPassword((previous) => !previous)}
            accessibilityRole="button"
            accessibilityLabel={
              showPassword ? "Hide password" : "Show password"
            }
          >
            <InputIcon
              as={showPassword ? EyeOffIcon : EyeIcon}
              className="text-ui-slate"
            />
          </InputSlot>
        ) : null}
      </Input>

    </FormField>
  );
};
