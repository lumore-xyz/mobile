import React from "react";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { UIActionsheet } from "./actionsheetContext";
import { actionsheetStyle } from "./actionsheetStyles";

type ActionsheetProps = VariantProps<typeof actionsheetStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet>;

const Actionsheet = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet>,
  ActionsheetProps
>(function Actionsheet({ className, ...props }, ref) {
  return (
    <UIActionsheet
      className={actionsheetStyle({ class: className })}
      ref={ref}
      {...props}
    />
  );
});

export default Actionsheet;
