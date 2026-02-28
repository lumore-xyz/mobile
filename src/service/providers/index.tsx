import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { ConfettiProvider } from "../context/Confetti";
import { ExploreChatProvider } from "../context/ExploreChatContext";
import { SocketProvider } from "../context/SocketContext";
import { queryClient } from "../query-client";
import { AdProvider } from "./AdProvider";
import { LocationProvider } from "./LocationProvider";
import { NsfwProvider } from "./NsfwProvider";
import { OptionsProvider } from "./OptionsProvider";

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView>
        <NsfwProvider>
          <AdProvider>
            <LocationProvider>
              <OptionsProvider>
                <SocketProvider>
                  <ConfettiProvider>
                    <ExploreChatProvider>{children}</ExploreChatProvider>
                  </ConfettiProvider>
                </SocketProvider>
              </OptionsProvider>
            </LocationProvider>
          </AdProvider>
        </NsfwProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

export default Provider;
