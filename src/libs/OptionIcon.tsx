import React from "react";

import { getLucideOptionIcon } from "./optionIcons";
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
  if (!icon) {
    return null;
  }

  if (icon.library === "Lucide") {
    const LucideIcon = getLucideOptionIcon(icon.name);
    if (!LucideIcon) return null;
    return (
      <LucideIcon
        size={size}
        color={color}
        className={className}
      />
    );
  }

  return null;
};

export default OptionIcon;
