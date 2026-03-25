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
import { AlertCircleIcon } from "./icon";
import { Input, InputField } from "./input";
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
      <Input className="mt-1" size="xl">
        <InputField
          type={type}
          placeholder={placeholder}
          nativeID={label}
          value={value}
          onChangeText={(text) => action(text)}
        />
      </Input>

      <FormControlHelper>
        <FormControlHelperText>{helperText}</FormControlHelperText>
      </FormControlHelper>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
        <FormControlErrorText className="text-red-500">
          {errorText}
        </FormControlErrorText>
      </FormControlError>
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
  type = "text",
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

      <FormControlHelper>
        <FormControlHelperText>{helperText}</FormControlHelperText>
      </FormControlHelper>

      <FormControlError>
        <FormControlErrorIcon as={AlertCircleIcon} className="text-red-500" />
        <FormControlErrorText className="text-red-500">
          {errorText}
        </FormControlErrorText>
      </FormControlError>
    </FormControl>
  );
};
