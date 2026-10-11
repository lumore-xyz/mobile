import React from "react";
import { Text } from "react-native";
import type { TextProps } from "react-native";

type ActionSheetSectionHeaderTextProps = TextProps & {
  className?: string;
};

const ActionSheetSectionHeaderText = React.forwardRef<
  React.ComponentRef<typeof Text>,
  ActionSheetSectionHeaderTextProps
>(function ActionSheetSectionHeaderText(props, ref) {
  return <Text ref={ref} accessibilityRole="header" {...props} />;
});

ActionSheetSectionHeaderText.displayName = "ActionSheetSectionHeaderText";

export default ActionSheetSectionHeaderText;
