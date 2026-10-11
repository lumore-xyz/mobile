import React from "react";
import {
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { TEXTAREA_SCOPE, UITextarea } from "./textareaContext";
import { textareaInputStyle } from "./textareaStyles";

type TextareaInputProps = React.ComponentProps<typeof UITextarea.Input> &
  VariantProps<typeof textareaInputStyle>;

const TextareaInput = React.forwardRef<
  React.ComponentRef<typeof UITextarea.Input>,
  TextareaInputProps
>(function TextareaInput({ className, ...props }, ref) {
  const { size: parentSize } = useStyleContext(TEXTAREA_SCOPE);

  return (
    <UITextarea.Input
      ref={ref}
      {...props}
      textAlignVertical="top"
      className={textareaInputStyle({
        parentVariants: { size: parentSize },
        class: className,
      })}
    />
  );
});

TextareaInput.displayName = "TextareaInput";

export default TextareaInput;
