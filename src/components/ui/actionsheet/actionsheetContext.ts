import { createActionsheet } from "@gluestack-ui/core/actionsheet/creator";
import { PrimitiveIcon, UIIcon } from "@gluestack-ui/core/icon/creator";
import { AnimatePresence, createMotionAnimatedComponent, Motion } from "@legendapp/motion";
import { cssInterop } from "nativewind";
import React from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  SectionList,
  Text,
  View,
  type ViewStyle,
  VirtualizedList,
} from "react-native";
import ActionSheetSectionHeaderText from "./ActionSheetSectionHeaderText";
import ActionsheetItemPrimitive from "./ActionsheetItemPrimitive";

type MotionViewProps = React.ComponentProps<typeof View> &
  import("@legendapp/motion").MotionComponentProps<
    typeof View,
    ViewStyle,
    unknown,
    unknown,
    unknown
  >;

type AnimatedPressableProps = React.ComponentProps<typeof Pressable> &
  import("@legendapp/motion").MotionComponentProps<
    typeof Pressable,
    ViewStyle,
    unknown,
    unknown,
    unknown
  >;

const MotionView = Motion.View as React.ComponentType<MotionViewProps>;
const AnimatedPressable = createMotionAnimatedComponent(
  Pressable,
) as React.ComponentType<AnimatedPressableProps>;

export const UIActionsheet = createActionsheet({
  Root: View,
  Content: MotionView,
  Item: ActionsheetItemPrimitive,
  ItemText: Text,
  DragIndicator: View,
  IndicatorWrapper: View,
  Backdrop: AnimatedPressable,
  ScrollView,
  VirtualizedList,
  FlatList,
  SectionList,
  SectionHeaderText: ActionSheetSectionHeaderText,
  Icon: UIIcon,
  AnimatePresence,
});

cssInterop(UIActionsheet, { className: "style" });
cssInterop(UIActionsheet.Content, { className: "style" });
cssInterop(ActionsheetItemPrimitive, { className: "style" });
cssInterop(UIActionsheet.ItemText, { className: "style" });
cssInterop(UIActionsheet.DragIndicator, { className: "style" });
cssInterop(UIActionsheet.DragIndicatorWrapper, { className: "style" });
cssInterop(UIActionsheet.Backdrop, { className: "style" });
cssInterop(UIActionsheet.ScrollView, {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
  indicatorClassName: "indicatorStyle",
});
cssInterop(UIActionsheet.VirtualizedList, {
  className: "style",
  ListFooterComponentClassName: "ListFooterComponentStyle",
  ListHeaderComponentClassName: "ListHeaderComponentStyle",
  contentContainerClassName: "contentContainerStyle",
  indicatorClassName: "indicatorStyle",
});
cssInterop(UIActionsheet.FlatList, {
  className: "style",
  ListFooterComponentClassName: "ListFooterComponentStyle",
  ListHeaderComponentClassName: "ListHeaderComponentStyle",
  columnWrapperClassName: "columnWrapperStyle",
  contentContainerClassName: "contentContainerStyle",
  indicatorClassName: "indicatorStyle",
});
cssInterop(UIActionsheet.SectionList, { className: "style" });
cssInterop(UIActionsheet.SectionHeaderText, { className: "style" });
cssInterop(PrimitiveIcon, {
  className: {
    target: "style",
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: "classNameColor",
      stroke: true,
    },
  },
});
