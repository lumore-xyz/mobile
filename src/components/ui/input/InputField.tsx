import React from "react";
import {
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { INPUT_SCOPE, UIInput } from "./inputContext";
import { inputFieldStyle } from "./inputStyles";

type InputFieldProps = React.ComponentProps<typeof UIInput.Input> &
  VariantProps<typeof inputFieldStyle> & { className?: string };

const InputField = React.forwardRef<
  React.ComponentRef<typeof UIInput.Input>,
  InputFieldProps
>(function InputField({ className, ...props }, ref) {
  const { variant: parentVariant, size: parentSize } =
    useStyleContext(INPUT_SCOPE);

  return (
    <UIInput.Input
      ref={ref}
      {...props}
      className={inputFieldStyle({
        parentVariants: { variant: parentVariant, size: parentSize },
        class: className,
      })}
    />
  );
});

InputField.displayName = "InputField";

export default InputField;
