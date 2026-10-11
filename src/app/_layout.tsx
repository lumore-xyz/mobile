import "@/global.css";
import RootLayoutContent from "@/src/components/layout/RootLayoutContent";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useGlobalScreenProtection } from "../hooks/useGlobalScreenProtection";
import { configureGoogleSignIn } from "../service/google-signin";
import { OneSignalProvider } from "../service/providers/OneSignalProvider";

configureGoogleSignIn();

export default function RootLayout() {
  // Root-level mounting protects the entire Expo Router tree by default.
  useGlobalScreenProtection();

  return (
    <OneSignalProvider>
      <SafeAreaProvider>
        <RootLayoutContent />
      </SafeAreaProvider>
    </OneSignalProvider>
  );
}
