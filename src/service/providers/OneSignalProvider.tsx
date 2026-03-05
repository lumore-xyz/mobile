import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LogBox } from "react-native";
import { LogLevel, OneSignal } from "react-native-onesignal";
import config from "../config";

interface OneSignalContextValue {
  notificationGranted: boolean | null;
  checkNotificationPermission: (requestIfMissing: boolean) => Promise<boolean>;
}

const OneSignalContext = createContext<OneSignalContextValue | undefined>(
  undefined,
);

export const OneSignalProvider = ({ children }: { children: ReactNode }) => {
  const [notificationGranted, setNotificationGranted] = useState<boolean | null>(
    null,
  );

  const checkNotificationPermission = useCallback(
    async (requestIfMissing: boolean) => {
      if (!config.ONESIGNAL_APP_ID) {
        setNotificationGranted(false);
        return false;
      }

      let granted = false;
      try {
        granted = await OneSignal.Notifications.getPermissionAsync();

        if (!granted && requestIfMissing) {
          const canAsk =
            await OneSignal.Notifications.canRequestPermission();
          if (canAsk) {
            granted = await OneSignal.Notifications.requestPermission(false);
          }
        }
      } catch {
        granted = false;
      }

      setNotificationGranted(granted);
      return granted;
    },
    [],
  );

  useEffect(() => {
    LogBox.ignoreLogs(["new NativeEventEmitter"]);
    OneSignal.Debug.setLogLevel(LogLevel.None);

    if (config.ONESIGNAL_APP_ID) {
      OneSignal.initialize(config.ONESIGNAL_APP_ID);
    }
  }, []);

  const value = useMemo<OneSignalContextValue>(
    () => ({
      notificationGranted,
      checkNotificationPermission,
    }),
    [checkNotificationPermission, notificationGranted],
  );

  return (
    <OneSignalContext.Provider value={value}>{children}</OneSignalContext.Provider>
  );
};

export const useOneSignal = () => {
  const context = useContext(OneSignalContext);
  if (!context) {
    throw new Error("useOneSignal must be used within OneSignalProvider");
  }
  return context;
};
