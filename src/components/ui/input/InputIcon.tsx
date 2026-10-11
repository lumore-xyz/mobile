import React from "react";
import {
  useStyleContext,
  type VariantProps,
} from "@gluestack-ui/utils/nativewind-utils";
import { INPUT_SCOPE, UIInput } from "./inputContext";
import { inputIconStyle } from "./inputStyles";

type InputIconProps = React.ComponentProps<typeof UIInput.Icon> &
  VariantProps<typeof inputIconStyle> & {
    className?: string;
    height?: number;
    width?: number;
  };

const InputIcon = React.forwardRef<
  React.ComponentRef<typeof UIInput.Icon>,
  InputIconProps
>(function InputIcon({ className, size, ...props }, ref) {
  const { size: parentSize } = useStyleContext(INPUT_SCOPE);

  if (typeof size === "number") {
    return (
      <UIInput.Icon
        ref={ref}
        {...props}
        className={inputIconStyle({ class: className })}
        size={size}
      />
    );
  }

  if ((props.height !== undefined || props.width !== undefined) && size === undefined) {
    return (
      <UIInput.Icon
        ref={ref}
        {...props}
        className={inputIconStyle({ class: className })}
      />
    );
  }

  return (
    <UIInput.Icon
      ref={ref}
      {...props}
      className={inputIconStyle({
        parentVariants: { size: parentSize },
        class: className,
      })}
    />
  );
});

InputIcon.displayName = "InputIcon";

export default InputIcon;
