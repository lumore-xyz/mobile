import React, { ReactNode } from "react";
import { Text } from "react-native";

type ExploreHeroCopyProps = { children: ReactNode };

export default function ExploreHeroCopy({ children }: ExploreHeroCopyProps) {
  return (
    <Text className="mt-2 max-w-80 text-center text-sm leading-5 text-ui-paper/80">
      {children}
    </Text>
  );
}

