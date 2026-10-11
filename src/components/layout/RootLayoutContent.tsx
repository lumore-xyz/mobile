import AppUpdatePrompt from "@/src/components/ui/AppUpdatePrompt";
import { GluestackUIProvider } from "@/src/components/ui/gluestack-ui-provider";
import { KeyboardDodgingView } from "@/src/components/layout/KeyboardDodgingView";
import { COLORS } from "@/src/libs/constants/theme";
import Provider from "@/src/service/providers";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

const screenOptions = {
  headerShown: false,
  animation: "none",
} as const;

const RootLayoutContent = () => {
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

export default RootLayoutContent;
