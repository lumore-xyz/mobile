import apiClient from "./api-client";
import { APP_VERSION_QUERY_KEY } from "./query-keys";

export type AppVersionPlatform = "android" | "ios";

export type AppVersionConfig = {
  platform: AppVersionPlatform;
  latestVersion: string;
  minimumSupportedVersion: string;
  forceUpdate: boolean;
  playStoreUrl: string;
  appStoreUrl: string;
  updateTitle: string;
  updateMessage: string;
  isActive: boolean;
  updatedAt?: string | null;
};

const FALLBACK_CONFIG: AppVersionConfig = {
  platform: "android",
  latestVersion: "0.0.0",
  minimumSupportedVersion: "0.0.0",
  forceUpdate: false,
  playStoreUrl: "",
  appStoreUrl: "",
  updateTitle: "Update available",
  updateMessage:
    "A new version of the app is available. Please update for the best experience.",
  isActive: true,
  updatedAt: null,
};

export const getCachedAppVersionKey = (platform: AppVersionPlatform) =>
  `${APP_VERSION_QUERY_KEY[0]}:${platform}`;

export const fetchAppVersionConfig = async (
  platform: AppVersionPlatform,
): Promise<AppVersionConfig | null> => {
  try {
    const response = await apiClient.get("/app-version", {
      params: { platform },
    });
    const data = response?.data?.data ?? response?.data ?? null;
    if (!data) return null;
    return {
      ...FALLBACK_CONFIG,
      ...data,
      platform,
    };
  } catch {
    return null;
  }
};
