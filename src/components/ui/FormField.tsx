import { createFormControl } from "@gluestack-ui/core/form-control/creator";
import { withStyleContext } from "@gluestack-ui/utils/nativewind-utils";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React, { type ReactNode } from "react";
import { Text, View } from "react-native";

const SCOPE = "FORM_CONTROL";

const UIFormControl = createFormControl({
  Root: withStyleContext(View, SCOPE),
  Error: View,
  ErrorText: Text,
  ErrorIcon: View,
  Label: View,
  LabelText: Text,
  LabelAstrick: Text,
  Helper: View,
  HelperText: Text,
});

interface FormFieldProps {
  label: string;
  children: ReactNode;
  helperText?: string;
  errorText?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
  compact?: boolean;
  labelTextClassName?: string;
}

export default function FormField({
  label,
  children,
  helperText,
  errorText,
  isInvalid,
  isDisabled,
  isReadOnly,
  isRequired,
  compact,
  labelTextClassName,
}: FormFieldProps) {
  return (
    <UIFormControl
      className="flex flex-col"
      isInvalid={isInvalid}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      isRequired={isRequired}
      context={{ size: "md" }}
    >
      <UIFormControl.Label className={compact ? "mb-0" : undefined}>
        <UIFormControl.Label.Text
          className={`text-base font-semibold ${labelTextClassName || "text-ui-ink"}`}
        >
          {label}
        </UIFormControl.Label.Text>
      </UIFormControl.Label>
      {children}
      {helperText ? (
        <UIFormControl.Helper className="mt-1 flex-row items-center justify-start">
          <UIFormControl.Helper.Text className="text-sm leading-5 text-ui-slate">
            {helperText}
          </UIFormControl.Helper.Text>
        </UIFormControl.Helper>
      ) : null}
      {errorText ? (
        <UIFormControl.Error className="mt-1 flex-row items-center justify-start gap-1">
          <Icon name="CircleAlert" size={18} color={COLORS.danger} />
          <UIFormControl.Error.Text className="text-ui-danger">
            {errorText}
          </UIFormControl.Error.Text>
        </UIFormControl.Error>
      ) : null}
    </UIFormControl>
  );
}
