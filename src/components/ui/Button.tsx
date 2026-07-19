import { triggerSelectionHaptic } from "@/src/utils/haptics";
import clsxLib from 'clsx';
import React from 'react';
import { GestureResponderEvent, Pressable, Text } from 'react-native';

type ButtonProps = {
  onClick?: (event?: GestureResponderEvent) => void;
  text?: string;
  size?: "sm" | "md" | "lg" | "icon";
  variant?: "primary" | "danger" | "secondary" | "outline";
  className?: string; // optional additional classes
  disabled?: boolean;
  children?: React.ReactNode;
  hapticFeedback?: boolean;
  accessibilityLabel?: string;
};

const sizeStyles = {
  sm: "min-h-11 py-2 px-3",
  md: "min-h-12 py-3 px-5",
  lg: "min-h-12 py-4 px-6",
  icon: "min-h-11 min-w-11 p-2.5 aspect-square",
};

const sizeTextStyles = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  icon: "text-base",
};

const variantStyles = {
  primary: "bg-ui-highlight",
  danger: "bg-ui-danger",
  secondary: "bg-ui-light border border-ui-border",
  outline: "bg-transparent border border-ui-highlight/40",
};

const variantTextStyles = {
  primary: "text-ui-light",
  danger: "text-ui-light",
  secondary: "text-ui-dark",
  outline: "text-ui-dark",
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  text,
  size = "md",
  variant = "primary",
  className = "",
  disabled = false,
  children,
  hapticFeedback = true,
  accessibilityLabel,
}) => {
  const handlePress = (event: GestureResponderEvent) => {
    if (hapticFeedback) {
      triggerSelectionHaptic();
    }
    onClick?.(event);
  };

  return (
    <Pressable
      className={clsxLib(
        "flex items-center justify-center rounded-full active:opacity-85",
        sizeStyles[size],
        variantStyles[variant],
        disabled && "opacity-60",
        className,
      )}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityState={{ disabled }}
    >
      {children ? (
        children
      ) : (
        <Text
          className={clsxLib(
            "font-semibold",
            variantTextStyles[variant],
            sizeTextStyles[size],
          )}
        >
          {text}
        </Text>
      )}
    </Pressable>
  );
};

export default Button;
