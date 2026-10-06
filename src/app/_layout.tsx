import "@/global.css";
import { KeyboardDodgingView } from "@/src/components/layout/KeyboardDodgingView";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";
import { COLORS } from "../libs/constants/theme";
import AppUpdatePrompt from "../components/ui/AppUpdatePrompt";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import { useGlobalScreenProtection } from "../hooks/useGlobalScreenProtection";
import { configureGoogleSignIn } from "../service/google-signin";
import Provider from "../service/providers";
import { OneSignalProvider } from "../service/providers/OneSignalProvider";

const screenOptions = {
  headerShown: false,
  animation: "none",
} as const;
configureGoogleSignIn();

export default function RootLayout() {
  // Root-level mounting protects the entire Expo Router tree by default.
  useGlobalScreenProtection();

  return (
    <OneSignalProvider>
      <SafeAreaProvider>
        <RootSafeAreaContent />
      </SafeAreaProvider>
    </OneSignalProvider>
  );
}

const RootSafeAreaContent = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-ui-porcelain"
      style={{
        paddingTop: insets.top,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
      }}
    >
      <KeyboardDodgingView>
        <GluestackUIProvider mode="light">
          <Provider>
            <Stack screenOptions={screenOptions} />
          </Provider>
          <AppUpdatePrompt />
          <StatusBar style="dark" backgroundColor={COLORS.porcelain} />
        </GluestackUIProvider>
      </KeyboardDodgingView>
    </View>
  );
};
