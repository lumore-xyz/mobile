import React from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { UITextarea } from "./textareaContext";
import { textareaStyle } from "./textareaStyles";

type TextareaProps = React.ComponentProps<typeof UITextarea> &
  VariantProps<typeof textareaStyle>;

const Textarea = React.forwardRef<
  React.ComponentRef<typeof UITextarea>,
  TextareaProps
>(function Textarea(
  { className, variant = "default", size = "md", ...props },
  ref,
) {
  return (
    <UITextarea
      ref={ref}
      {...props}
      className={textareaStyle({ variant, class: className })}
      context={{ size }}
    />
  );
});

Textarea.displayName = "Textarea";

export default Textarea;
