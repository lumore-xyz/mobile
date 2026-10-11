import React from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { UIActionsheet } from "./actionsheetContext";
import { actionsheetItemStyle } from "./actionsheetStyles";

type ActionsheetItemProps = VariantProps<typeof actionsheetItemStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.Item>;

const ActionsheetItem = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Item>,
  ActionsheetItemProps
>(function ActionsheetItem({ className, ...props }, ref) {
  return (
    <UIActionsheet.Item
      className={actionsheetItemStyle({ class: className })}
      ref={ref}
      {...props}
    />
  );
});

export default ActionsheetItem;
