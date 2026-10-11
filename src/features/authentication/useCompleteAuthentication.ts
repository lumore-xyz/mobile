import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useOneSignal } from "@/src/service/providers/OneSignalProvider";
import { getIsOnboarded } from "@/src/service/storage";

export default function useCompleteAuthentication() {
  const router = useRouter();
  const { checkNotificationPermission } = useOneSignal();

  return useCallback(async (userId: string) => {
    await checkNotificationPermission(true);
    const isOnboarded = Boolean(getIsOnboarded(userId));
    router.replace(isOnboarded ? "/explore" : "/(onboarding)/onboarding");
  }, [checkNotificationPermission, router]);
}
