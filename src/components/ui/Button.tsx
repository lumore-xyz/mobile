import clsxLib from "clsx"; // optional but great for conditional classNames
import React from "react";
import { GestureResponderEvent, Text, TouchableOpacity } from "react-native";

type ButtonProps = {
  onClick?: (event?: GestureResponderEvent) => void;
  text?: string;
  size?: "sm" | "md" | "lg" | "icon";
  variant?: "primary" | "danger" | "secondary" | "outline";
  className?: string; // optional additional classes
  disabled?: boolean;
  children?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  onClick,
  text,
  size = "md",
  variant = "primary",
  className = "",
  disabled = false,
  children,
}) => {
  // Size styles
  const sizeStyles = {
    sm: "py-2 px-4",
    md: "py-4 px-6",
    lg: "py-6 px-8",
    icon: "p-3 aspect-square",
  };
  const sizeTextStyles = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    icon: "text-base",
  };

  // Variant styles
  const variantStyles = {
    primary: "bg-ui-highlight border border-ui-shade/30",
    danger: "bg-red-600 border border-ui-shade/30",
    secondary: "bg-ui-light border border-ui-dark/10",
    outline: "bg-transparent  border border-ui-dark/50",
  };
  // Variant styles
  const variantTextStyles = {
    primary: "text-ui-light",
    danger: "text-ui-light",
    secondary: "text-ui-dark",
    outline: "text-ui-dark",
  };

  return (
    <TouchableOpacity
      className={clsxLib(
        "flex items-center justify-center rounded-2xl",
        sizeStyles[size],
        variantStyles[variant],
        disabled && "opacity-85",
        className, // allow user to pass additional classes
      )}
      onPress={() => onClick && onClick()}
      disabled={disabled}
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
    </TouchableOpacity>
  );
};

export default Button;
