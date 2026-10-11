import React from "react";
import { Image } from "react-native";
import { getLucideIcon } from "@/src/libs/lucideIcons";
import GRADUATION_IMAGE from "@/assets/images/graduation.webp";
import MASK_IMAGE from "@/assets/images/mask.webp";
import RELATIONSHIP_IMAGE from "@/assets/images/relationship.webp";

const iconImages: Record<string, number> = {
  "graduation.webp": GRADUATION_IMAGE,
  "relationship.webp": RELATIONSHIP_IMAGE,
  "mask.webp": MASK_IMAGE,
};

interface IconProps {
  name: string;
  type?: string;
  size?: number;
  color?: string;
  className?: string;
}

const Icon = ({
  name,
  type,
  size,
  color,
  className,
}: IconProps) => {
  if (type === "image") {
    const imageSource = iconImages[name];
    if (!imageSource) return null;
    return (
      <Image
        source={imageSource}
        resizeMode="contain"
        className={`h-8 w-8 ${className ?? ""}`}
      />
    );
  }

  const LucideIcon = getLucideIcon(name);
  if (!LucideIcon) return null;

  return (
    <LucideIcon
      color={color}
      size={size}
      className={`flex-shrink-0 ${className ?? ""}`}
    />
  );
};

export default Icon;
