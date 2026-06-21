import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ConfettiProvider } from "../context/Confetti";
import { ExploreChatProvider } from "../context/ExploreChatContext";
import { SocketProvider } from "../context/SocketContext";
import { queryClient } from "../query-client";
import NotificationSyncProvider from "./NotificationSyncProvider";
import { AdProvider } from "./AdProvider";
import { LocationProvider } from "./LocationProvider";
import { OptionsProvider } from "./OptionsProvider";
import { ReferralAttributionProvider } from "./ReferralAttributionProvider";

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.root}>
        <AdProvider>
          <LocationProvider>
            <OptionsProvider>
              <ReferralAttributionProvider>
                <SocketProvider>
                  <NotificationSyncProvider>
                    <ConfettiProvider>
                      <ExploreChatProvider>{children}</ExploreChatProvider>
                    </ConfettiProvider>
                  </NotificationSyncProvider>
                </SocketProvider>
              </ReferralAttributionProvider>
            </OptionsProvider>
          </LocationProvider>
        </AdProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

export default Provider;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
