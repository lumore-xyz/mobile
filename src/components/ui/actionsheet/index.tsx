"use client";
import { createActionsheet } from "@gluestack-ui/core/actionsheet/creator";
import { PrimitiveIcon, UIIcon } from "@gluestack-ui/core/icon/creator";
import { H4 } from "@expo/html-elements";
import type { VariantProps } from "@gluestack-ui/utils/nativewind-utils";
import { tva } from "@gluestack-ui/utils/nativewind-utils";
import {
  AnimatePresence,
  createMotionAnimatedComponent,
  Motion,
  MotionComponentProps,
} from "@legendapp/motion";
import { cssInterop } from "nativewind";
import React from "react";
import {
  FlatList,
  Pressable,
  PressableProps,
  ScrollView,
  SectionList,
  Text,
  View,
  ViewStyle,
  VirtualizedList,
} from "react-native";

const ItemWrapper = React.forwardRef<
  React.ComponentRef<typeof Pressable>,
  PressableProps
>(function ItemWrapper({ ...props }, ref) {
  return <Pressable {...props} ref={ref} />;
});

type IMotionViewProps = React.ComponentProps<typeof View> &
  MotionComponentProps<typeof View, ViewStyle, unknown, unknown, unknown>;

const MotionView = Motion.View as React.ComponentType<IMotionViewProps>;

type IAnimatedPressableProps = React.ComponentProps<typeof Pressable> &
  MotionComponentProps<typeof Pressable, ViewStyle, unknown, unknown, unknown>;

const AnimatedPressable = createMotionAnimatedComponent(
  Pressable,
) as React.ComponentType<IAnimatedPressableProps>;

const UIActionsheet = createActionsheet({
  Root: View,
  Content: MotionView,
  Item: ItemWrapper,
  ItemText: Text,
  DragIndicator: View,
  IndicatorWrapper: View,
  Backdrop: AnimatedPressable,
  ScrollView,
  VirtualizedList,
  FlatList,
  SectionList,
  SectionHeaderText: H4,
  Icon: UIIcon,
  AnimatePresence: AnimatePresence,
});

cssInterop(UIActionsheet, { className: "style" });
cssInterop(UIActionsheet.Content, { className: "style" });
cssInterop(ItemWrapper, { className: "style" });
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
const actionsheetStyle = tva({ base: "w-full h-full web:pointer-events-none" });

const actionsheetContentStyle = tva({
  base: "items-center rounded-tl-3xl rounded-tr-3xl pt-2 bg-ui-paper web:pointer-events-auto web:select-none shadow-hard-5 border border-b-0 border-ui-ink/10 pb-safe",
});

const actionsheetItemStyle = tva({
  base: "w-full flex-row items-center p-3 rounded-lg data-[disabled=true]:opacity-40 data-[disabled=true]:web:pointer-events-auto data-[disabled=true]:web:cursor-not-allowed hover:bg-ui-forest/5 active:bg-ui-forest/10 data-[focus=true]:bg-ui-forest/10 web:data-[focus-visible=true]:bg-ui-forest/10 web:data-[focus-visible=true]:outline-indicator-primary gap-2",
});

const actionsheetDragIndicatorStyle = tva({
  base: "w-16 h-1 bg-ui-ink/20 rounded-full",
});

const actionsheetDragIndicatorWrapperStyle = tva({
  base: "w-full py-1 items-center",
});

const actionsheetBackdropStyle = tva({
  base: "absolute left-0 top-0 right-0 bottom-0 bg-ui-ink/50 web:cursor-default web:pointer-events-auto",
});

type IActionsheetProps = VariantProps<typeof actionsheetStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet>;

type IActionsheetContentProps = VariantProps<typeof actionsheetContentStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.Content> & {
    className?: string;
  };

type IActionsheetItemProps = VariantProps<typeof actionsheetItemStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.Item>;

type IActionsheetDragIndicatorProps = VariantProps<
  typeof actionsheetDragIndicatorStyle
> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.DragIndicator>;

type IActionsheetDragIndicatorWrapperProps = VariantProps<
  typeof actionsheetDragIndicatorWrapperStyle
> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.DragIndicatorWrapper>;

type IActionsheetBackdropProps = VariantProps<typeof actionsheetBackdropStyle> &
  React.ComponentPropsWithoutRef<typeof UIActionsheet.Backdrop> & {
    className?: string;
  };

const Actionsheet = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet>,
  IActionsheetProps
>(function Actionsheet({ className, ...props }, ref) {
  return (
    <UIActionsheet
      className={actionsheetStyle({
        class: className,
      })}
      ref={ref}
      {...props}
    />
  );
});

const ActionsheetContent = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Content>,
  IActionsheetContentProps
>(function ActionsheetContent({ className, style, ...props }, ref) {
  return (
    <UIActionsheet.Content
      className={actionsheetContentStyle({
        class: className,
      })}
      style={[{ width: "100%", alignSelf: "center" }, style]}
      ref={ref}
      {...props}
    />
  );
});

const ActionsheetItem = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Item>,
  IActionsheetItemProps
>(function ActionsheetItem({ className, ...props }, ref) {
  return (
    <UIActionsheet.Item
      className={actionsheetItemStyle({
        class: className,
      })}
      ref={ref}
      {...props}
    />
  );
});

const ActionsheetDragIndicator = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.DragIndicator>,
  IActionsheetDragIndicatorProps
>(function ActionsheetDragIndicator({ className, ...props }, ref) {
  return (
    <UIActionsheet.DragIndicator
      className={actionsheetDragIndicatorStyle({
        class: className,
      })}
      ref={ref}
      {...props}
    />
  );
});

const ActionsheetDragIndicatorWrapper = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.DragIndicatorWrapper>,
  IActionsheetDragIndicatorWrapperProps
>(function ActionsheetDragIndicatorWrapper({ className, ...props }, ref) {
  return (
    <UIActionsheet.DragIndicatorWrapper
      className={actionsheetDragIndicatorWrapperStyle({
        class: className,
      })}
      ref={ref}
      {...props}
    />
  );
});

const ActionsheetBackdrop = React.forwardRef<
  React.ComponentRef<typeof UIActionsheet.Backdrop>,
  IActionsheetBackdropProps
>(function ActionsheetBackdrop({ className, ...props }, ref) {
  return (
    <UIActionsheet.Backdrop
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 0.5,
      }}
      exit={{
        opacity: 0,
      }}
      {...props}
      className={actionsheetBackdropStyle({
        class: className,
      })}
      ref={ref}
    />
  );
});

export {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  ActionsheetItem,
};
