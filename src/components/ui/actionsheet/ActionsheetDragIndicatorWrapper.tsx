import React from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { UIActionsheet } from "./actionsheetContext";
import { actionsheetDragIndicatorWrapperStyle } from "./actionsheetStyles";

type ActionsheetDragIndicatorWrapperProps =
  VariantProps<typeof actionsheetDragIndicatorWrapperStyle> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.DragIndicatorWrapper>;

const ActionsheetDragIndicatorWrapper = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.DragIndicatorWrapper>,
  ActionsheetDragIndicatorWrapperProps
>(function ActionsheetDragIndicatorWrapper({ className, ...props }, ref) {
  return (
    <UIActionsheet.DragIndicatorWrapper
      className={actionsheetDragIndicatorWrapperStyle({ class: className })}
      ref={ref}
      {...props}
    />
  );
});

export default ActionsheetDragIndicatorWrapper;
