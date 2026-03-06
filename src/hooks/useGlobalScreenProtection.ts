import { useEffect } from "react";
import * as ScreenCapture from "expo-screen-capture";

export function useGlobalScreenProtection(): void {
  useEffect(() => {
    const enableProtection = async () => {
      try {
        // Applies screen capture protection globally while the app is running.
        // Android enforces stronger screenshot/screen recording blocking.
        // iOS uses the same API, but platform-level protection is more limited.
        await ScreenCapture.preventScreenCaptureAsync();
      } catch (error: unknown) {
        console.error("Failed to enable global screen capture protection:", error);
      }
    };

    // Runs once on mount so protection is enabled as early as possible.
    void enableProtection();

    // No cleanup on purpose: this should remain active for the app lifecycle.
  }, []);
}
