import React from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { UIInput } from "./inputContext";
import { inputStyle } from "./inputStyles";

type InputProps = React.ComponentProps<typeof UIInput> &
  VariantProps<typeof inputStyle> & { className?: string };

const Input = React.forwardRef<React.ComponentRef<typeof UIInput>, InputProps>(
  function Input({ className, variant = "outline", size = "md", ...props }, ref) {
    return (
      <UIInput
        ref={ref}
        {...props}
        className={inputStyle({ variant, size, class: className })}
        context={{ variant, size }}
      />
    );
  },
);

Input.displayName = "Input";

export default Input;
