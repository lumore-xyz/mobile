type ExpoAudioModule = typeof import("expo-audio");

let cachedModule: ExpoAudioModule | null | undefined;

export const getExpoAudioModule = (): ExpoAudioModule | null => {
  if (cachedModule !== undefined) return cachedModule;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require("expo-audio") as ExpoAudioModule;
  } catch (error) {
    console.warn("[Audio] expo-audio native module unavailable:", error);
    cachedModule = null;
  }

  return cachedModule;
};
