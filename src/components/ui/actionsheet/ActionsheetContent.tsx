import React from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { UIActionsheet } from "./actionsheetContext";
import { actionsheetContentStyle } from "./actionsheetStyles";

type ActionsheetContentProps =
  VariantProps<typeof actionsheetContentStyle> &
    React.ComponentPropsWithoutRef<typeof UIActionsheet.Content> & {
      className?: string;
    };

const ActionsheetContent = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Content>,
  ActionsheetContentProps
>(function ActionsheetContent({ className, style, ...props }, ref) {
  return (
    <UIActionsheet.Content
      className={actionsheetContentStyle({ class: className })}
      style={[{ width: "100%", alignSelf: "center" }, style]}
      ref={ref}
      {...props}
    />
  );
});

export default ActionsheetContent;
