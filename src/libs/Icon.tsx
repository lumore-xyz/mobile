import {
  Feather,
  Fontisto,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import { Image } from "react-native";

const iconImages: Record<string, any> = {
  "graduation.png": require("@/assets/images/graduation.png"),
  "relationship.png": require("@/assets/images/relationship.png"),
  "mask.png": require("@/assets/images/mask.png"),
  "distance.png": require("@/assets/images/distance.png"),
  "cake.png": require("@/assets/images/cake.png"),
  // Add other image names here
};

const Icon = ({
  name,
  type,
  size,
  className,
  color,
}: {
  name: string;
  type: string;
  size?: number;
  className?: string;
  color?: string;
}) => {
  if (type === "MaterialCommunityIcons") {
    return (
      <MaterialCommunityIcons
        name={name as any}
        size={size}
        color={color ? color : undefined}
        className={`flex-shrink-0 ${className}`}
      />
    );
  } else if (type === "Feather") {
    return (
      <Feather
        name={name as any}
        size={size}
        color={color ? color : undefined}
        className={`flex-shrink-0 ${className}`}
      />
    );
  } else if (type === "Ionicons") {
    return (
      <Ionicons
        name={name as any}
        size={size}
        color={color ? color : undefined}
        className={`flex-shrink-0 ${className}`}
      />
    );
  } else if (type === "Fontisto") {
    return (
      <Fontisto
        name={name as any}
        size={size}
        color={color ? color : undefined}
        className={`flex-shrink-0 ${className}`}
      />
    );
  } else if (type === "MaterialIcons") {
    return (
      <MaterialIcons
        name={name as any}
        size={size}
        color={color ? color : undefined}
        className={`flex-shrink-0 ${className}`}
      />
    );
  } else {
    const imageSource = iconImages[name];
    return imageSource ? (
      <Image source={imageSource} className={`h-8 w-8 ${className ?? ""}`} />
    ) : null;
  }
};

export default Icon;
