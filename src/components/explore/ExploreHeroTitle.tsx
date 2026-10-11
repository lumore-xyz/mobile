import React, { ReactNode } from "react";
import { Text } from "react-native";

type ExploreHeroTitleProps = {
  children: ReactNode;
  compact?: boolean;
};

export default function ExploreHeroTitle({
  children,
  compact = false,
}: ExploreHeroTitleProps) {
  return (
    <Text
      className={`${compact ? "text-3xl leading-9" : "text-4xl leading-10"} mt-4 text-center font-semibold text-ui-paper`}
      accessibilityRole="header"
    >
      {children}
    </Text>
  );
}

