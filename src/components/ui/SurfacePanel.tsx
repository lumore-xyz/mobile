import type { PropsWithChildren } from "react";
import { View } from "react-native";

const surfaceClasses = {
  midnight: "rounded-[24px] bg-ui-midnight p-5",
  paper: "rounded-[24px] border border-ui-parchment bg-ui-paper p-5",
} as const;

interface SurfacePanelProps extends PropsWithChildren {
  surface: keyof typeof surfaceClasses;
  className?: string;
}

export default function SurfacePanel({
  children,
  surface,
  className = "",
}: SurfacePanelProps) {
  return (
    <View className={`${surfaceClasses[surface]} ${className}`}>
      {children}
    </View>
  );
}
