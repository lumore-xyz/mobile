import "@/global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Linking,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { GluestackUIProvider } from "../components/ui/gluestack-ui-provider";
import Provider from "../service/providers";
import {
  OneSignalProvider,
  useOneSignal,
} from "../service/providers/OneSignalProvider";

type RequiredPermissionState = {
  locationGranted: boolean;
  notificationGranted: boolean;
};

export default function RootLayout() {
  return (
    <OneSignalProvider>
      <RootLayoutContent />
    </OneSignalProvider>
  );
}

function RootLayoutContent() {
  const [permissions, setPermissions] = useState<RequiredPermissionState | null>(
    null,
  );
  const alertKeyRef = useRef<string>("");
  const { checkNotificationPermission } = useOneSignal();

  const checkRequiredPermissions = useCallback(
    async (requestIfMissing: boolean) => {
      let locationGranted = false;
      let nextNotificationGranted = false;

      try {
        let locationPerm = await Location.getForegroundPermissionsAsync();
        locationGranted = locationPerm.status === "granted";

        if (!locationGranted && requestIfMissing && locationPerm.canAskAgain) {
          locationPerm = await Location.requestForegroundPermissionsAsync();
          locationGranted = locationPerm.status === "granted";
        }

        nextNotificationGranted = await checkNotificationPermission(
          requestIfMissing,
        );
      } catch {
        locationGranted = false;
        nextNotificationGranted = false;
      }

      const next = {
        locationGranted,
        notificationGranted: nextNotificationGranted,
      };
      setPermissions(next);
      return next;
    },
    [checkNotificationPermission],
  );

  const openSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  useEffect(() => {
    void checkRequiredPermissions(true);

    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") {
          void checkRequiredPermissions(false);
        }
      },
    );

    return () => {
      appStateSubscription.remove();
    };
  }, [checkRequiredPermissions]);

  useEffect(() => {
    if (!permissions) return;

    const missing: string[] = [];
    if (!permissions.locationGranted) missing.push("Location");
    if (!permissions.notificationGranted) missing.push("Notification");
    if (missing.length === 0) {
      alertKeyRef.current = "";
      return;
    }

    const alertKey = missing.join("|");
    if (alertKeyRef.current === alertKey) return;
    alertKeyRef.current = alertKey;

    Alert.alert(
      "Permissions required",
      `Lumore requires ${missing.join(
        " and ",
      )} permission${missing.length > 1 ? "s" : ""}. Please enable in Settings.`,
      [
        { text: "Open Settings", onPress: openSettings },
        {
          text: "Retry",
          onPress: () => {
            void checkRequiredPermissions(true);
          },
        },
      ],
      { cancelable: false },
    );
  }, [checkRequiredPermissions, openSettings, permissions]);

  const hasRequiredPermissions = Boolean(
    permissions?.locationGranted && permissions?.notificationGranted,
  );

  return (
    <GluestackUIProvider mode="light">
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-ui-light">
          {!hasRequiredPermissions ? (
            <View className="flex-1 items-center justify-center px-6 bg-ui-light">
              <Text className="text-2xl font-bold text-ui-shade text-center">
                Permissions Required
              </Text>
              <Text className="mt-3 text-center text-ui-shade/80">
                Please enable Location and Notification permissions in Settings
                to continue using Lumore.
              </Text>
              <View className="mt-5 w-full gap-3">
                <Pressable
                  onPress={openSettings}
                  className="bg-ui-highlight rounded-2xl px-4 py-4"
                >
                  <Text className="text-center text-ui-light font-semibold">
                    Open Settings
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    void checkRequiredPermissions(true);
                  }}
                  className="border border-ui-shade/20 rounded-2xl px-4 py-4"
                >
                  <Text className="text-center text-ui-shade font-semibold">
                    Retry Permission Check
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Provider>
              <Stack screenOptions={{ headerShown: false }} />
            </Provider>
          )}
          <StatusBar style="dark" backgroundColor="#E6F4FE" />
        </SafeAreaView>
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
