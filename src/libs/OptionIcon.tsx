import React from "react";

import { Ionicons } from "@expo/vector-icons";

import { isKnownOptionIconName } from "./optionIcons";
import type { SelectOptionIcon } from "./options";

export interface OptionIconProps {
  icon?: SelectOptionIcon | null;
  size?: number;
  color?: string;
  className?: string;
}

const OptionIcon: React.FC<OptionIconProps> = ({
  icon,
  size = 18,
  color,
  className,
}) => {
  if (!icon || !isKnownOptionIconName(icon.library, icon.name)) {
    return null;
  }
  if (icon.library !== "Ionicons") {
    return null;
  }
  return (
    <Ionicons
      name={icon.name as any}
      size={size}
      color={color}
      className={className}
    />
  );
};

export default OptionIcon;
