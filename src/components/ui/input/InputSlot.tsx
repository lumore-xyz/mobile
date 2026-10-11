import React from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { UIInput } from "./inputContext";
import { inputSlotStyle } from "./inputStyles";

type InputSlotProps = React.ComponentProps<typeof UIInput.Slot> &
  VariantProps<typeof inputSlotStyle> & { className?: string };

const InputSlot = React.forwardRef<
  React.ComponentRef<typeof UIInput.Slot>,
  InputSlotProps
>(function InputSlot({ className, ...props }, ref) {
  return (
    <UIInput.Slot
      ref={ref}
      {...props}
      className={inputSlotStyle({ class: className })}
    />
  );
});

InputSlot.displayName = "InputSlot";

export default InputSlot;
