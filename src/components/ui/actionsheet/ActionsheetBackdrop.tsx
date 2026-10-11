import React from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { UIActionsheet } from "./actionsheetContext";
import { actionsheetBackdropStyle } from "./actionsheetStyles";

type ActionsheetBackdropProps = VariantProps<typeof actionsheetBackdropStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.Backdrop> & {
    className?: string;
  };

const ActionsheetBackdrop = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Backdrop>,
  ActionsheetBackdropProps
>(function ActionsheetBackdrop({ className, ...props }, ref) {
  return (
    <UIActionsheet.Backdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
      {...props}
      className={actionsheetBackdropStyle({ class: className })}
      ref={ref}
    />
  );
});

export default ActionsheetBackdrop;
