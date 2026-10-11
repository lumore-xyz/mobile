import React from "react";
import { Pressable, type PressableProps } from "react-native";

const ActionsheetItemPrimitive = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  PressableProps
>(function ActionsheetItemPrimitive(props, ref) {
  return <Pressable {...props} ref={ref} />;
});

export default ActionsheetItemPrimitive;
