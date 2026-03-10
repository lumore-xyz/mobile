import React, { ReactNode, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { loadRuntimeConfigBlocking } from "../config";

export const RuntimeConfigProvider = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapRuntimeConfig = async () => {
      try {
        await loadRuntimeConfigBlocking();
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    void bootstrapRuntimeConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#E6F4FE",
        }}
      >
        <ActivityIndicator size="large" color="#1F2937" />
      </View>
    );
  }

  return <>{children}</>;
};
