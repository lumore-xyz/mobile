import "@/global.css";
import { KeyboardDodgingView } from "@/src/components/layout/KeyboardDodgingView";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import AppUpdatePrompt from "../components/ui/AppUpdatePrompt";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { useGlobalScreenProtection } from "../hooks/useGlobalScreenProtection";
import { configureGoogleSignIn } from "../service/google-signin";
import Provider from "../service/providers";
import { OneSignalProvider } from "../service/providers/OneSignalProvider";

const screenOptions = {
  headerShown: false,
  animation: "none",
};
configureGoogleSignIn();

export default function RootLayout() {
  // Root-level mounting protects the entire Expo Router tree by default.
  useGlobalScreenProtection();

  return (
    <OneSignalProvider>
      <SafeAreaProvider>
        <KeyboardDodgingView>
          <GluestackUIProvider mode="light">
            <SafeAreaView className="flex-1 bg-ui-light">
              <Provider>
                <Stack screenOptions={screenOptions as any} />
              </Provider>
              <AppUpdatePrompt />
              <StatusBar style="dark" backgroundColor="#E6F4FE" />
            </SafeAreaView>
          </GluestackUIProvider>
        </KeyboardDodgingView>
      </SafeAreaProvider>
    </OneSignalProvider>
  );
}
