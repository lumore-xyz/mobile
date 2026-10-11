import React from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { UIActionsheet } from "./actionsheetContext";
import { actionsheetDragIndicatorStyle } from "./actionsheetStyles";

type ActionsheetDragIndicatorProps =
  VariantProps<typeof actionsheetDragIndicatorStyle> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.DragIndicator>;

const ActionsheetDragIndicator = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.DragIndicator>,
  ActionsheetDragIndicatorProps
>(function ActionsheetDragIndicator({ className, ...props }, ref) {
  return (
    <UIActionsheet.DragIndicator
      className={actionsheetDragIndicatorStyle({ class: className })}
      ref={ref}
      {...props}
    />
  );
});

export default ActionsheetDragIndicator;
