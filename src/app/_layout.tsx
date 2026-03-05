import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import Provider from "../service/providers";
import { OneSignalProvider } from "../service/providers/OneSignalProvider";

export default function RootLayout() {
  return (
    <OneSignalProvider>
      <GluestackUIProvider mode="light">
        <SafeAreaProvider>
          <SafeAreaView className="flex-1 bg-ui-light">
            <Provider>
              <Stack screenOptions={{ headerShown: false }} />
            </Provider>
            <StatusBar style="dark" backgroundColor="#E6F4FE" />
          </SafeAreaView>
        </SafeAreaProvider>
      </GluestackUIProvider>
    </OneSignalProvider>
  );
}
