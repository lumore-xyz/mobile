import * as icons from "lucide-react-native/icons";
import React from "react";
import { Image, type ImageSourcePropType } from "react-native";

// eslint-disable-next-line @typescript-eslint/array-type
const ICON_NAMES = Object.keys(icons) as Array<keyof typeof icons>;
const ICON_NAME_SET = new Set<string>(ICON_NAMES);

export type LucideIconName = keyof typeof icons;

const iconImages: Record<string, ImageSourcePropType> = {
  "graduation.png": require("@/assets/images/graduation.png"),
  "relationship.png": require("@/assets/images/relationship.png"),
  "mask.png": require("@/assets/images/mask.png"),
  "distance.png": require("@/assets/images/distance.png"),
  "cake.png": require("@/assets/images/cake.png"),
};

const resolveIconName = (name: string): LucideIconName | null => {
  if (!name) return null;
  if (ICON_NAME_SET.has(name)) return name as LucideIconName;
  return null;
};

export interface IconProps {
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
      <Image source={imageSource} className={`h-8 w-8 ${className ?? ""}`} />
    );
  }

  const resolvedName = resolveIconName(name);
  if (!resolvedName) return null;

  // lucide-react-native/icons only exposes a namespace, so the icon has to be
  // looked up by computed key. The eslint rule can't validate this against the
  // generated .d.ts.
  // eslint-disable-next-line import/namespace
  const LucideIcon = icons[resolvedName];
  return (
    <LucideIcon
      color={color}
      size={size}
      className={`flex-shrink-0 ${className ?? ""}`}
    />
  );
};

export default Icon;