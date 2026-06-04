import {
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  FormControlHelperText,
  FormControlLabel,
  FormControlLabelText,
} from "./form-control";
import { AlertCircleIcon, EyeIcon, EyeOffIcon } from "./icon";
import { Input, InputField, InputIcon, InputSlot } from "./input";
import { useState } from "react";
import type { TextInputProps as NativeTextInputProps } from "react-native";
import { Textarea, TextareaInput } from "./textarea";

interface TextInputProps {
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
}) => {
  const isPasswordField = type === "password";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormControl
      isInvalid={isInvalid}
      size="md"
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
    >
      <FormControlLabel>
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>
      <Input className="mt-1" size="xl">
        <InputField
          type={isPasswordField && showPassword ? "text" : type}
          placeholder={placeholder}
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
              className="text-typography-500"
            />
          </InputSlot>
        ) : null}
      </Input>

      {helperText ? (
        <FormControlHelper>
          <FormControlHelperText>{helperText}</FormControlHelperText>
        </FormControlHelper>
      ) : null}

      {errorText ? (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
          <FormControlErrorText className="text-red-500">
            {errorText}
          </FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
};
export const TextAreaInput: React.FC<TextInputProps> = ({
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
}) => {
  return (
    <FormControl
      isInvalid={isInvalid}
      size="md"
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
    >
      <FormControlLabel>
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>
      <Textarea size="md" className="w-full">
        <TextareaInput
          nativeID={label}
          onChangeText={(text) => action(text)}
          value={value}
          placeholder={placeholder}
        />
      </Textarea>

      {helperText ? (
        <FormControlHelper>
          <FormControlHelperText>{helperText}</FormControlHelperText>
        </FormControlHelper>
      ) : null}

      {errorText ? (
        <FormControlError>
          <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
          <FormControlErrorText className="text-red-500">
            {errorText}
          </FormControlErrorText>
        </FormControlError>
      ) : null}
    </FormControl>
  );
};
