import {
  capturePendingReferralCode,
  getInstallReferrerProcessed,
  setInstallReferrerProcessed,
} from "@/src/service/storage";
import {
  extractReferralCodeFromInstallReferrer,
  extractReferralCodeFromUrl,
} from "@/src/service/referralAttribution";
import React, { ReactNode, useCallback, useEffect } from "react";
import { Linking, NativeModules, Platform } from "react-native";

type InstallReferrerNativeModule = {
  getInstallReferrer: () => Promise<string | null>;
};

const installReferrerModule = NativeModules
  .InstallReferrerModule as InstallReferrerNativeModule | undefined;

export const ReferralAttributionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const captureReferralFromUrl = useCallback((url: string | null | undefined) => {
    const code = extractReferralCodeFromUrl(url);
    if (!code) return;
    capturePendingReferralCode(code);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAttribution = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        if (isMounted) {
          captureReferralFromUrl(initialUrl);
        }
      } catch {
        // ignore initial URL errors to avoid blocking app startup
      }

      if (Platform.OS !== "android" || getInstallReferrerProcessed()) {
        return;
      }

      try {
        const installReferrer =
          await installReferrerModule?.getInstallReferrer?.();
        const code = extractReferralCodeFromInstallReferrer(installReferrer);
        if (code) {
          capturePendingReferralCode(code);
        }
      } catch {
        // ignore install-referrer failures and keep app startup stable
      } finally {
        setInstallReferrerProcessed();
      }
    };

    void bootstrapAttribution();

    const subscription = Linking.addEventListener("url", ({ url }) => {
      captureReferralFromUrl(url);
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [captureReferralFromUrl]);

  return <>{children}</>;
};
