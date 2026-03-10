import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { useGlobalScreenProtection } from "../hooks/useGlobalScreenProtection";
import Provider from "../service/providers";
import { OneSignalProvider } from "../service/providers/OneSignalProvider";
import { RuntimeConfigProvider } from "../service/providers/RuntimeConfigProvider";

export default function RootLayout() {
  // Root-level mounting protects the entire Expo Router tree by default.
  useGlobalScreenProtection();

  return (
    <RuntimeConfigProvider>
      <OneSignalProvider>
        <GluestackUIProvider mode="light">
          <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-ui-light">
              <Provider>
                <KeyboardAvoidingView
                  style={{ flex: 1 }}
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                  <Stack screenOptions={{ headerShown: false }} />
                </KeyboardAvoidingView>
              </Provider>
              <StatusBar style="dark" backgroundColor="#E6F4FE" />
            </SafeAreaView>
          </SafeAreaProvider>
        </GluestackUIProvider>
      </OneSignalProvider>
    </RuntimeConfigProvider>
  );
}
