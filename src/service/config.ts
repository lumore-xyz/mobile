import { Platform } from "react-native";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");
const ensureLeadingSlash = (value: string) =>
  value.startsWith("/") ? value : `/${value}`;

const fallbackBaseUrl =
  Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://localhost:5000";

const envBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
const envSocketNamespace = process.env.EXPO_PUBLIC_SOCKET_NAMESPACE?.trim();
const envAdmobInterstitialUnitId =
  process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID?.trim();
const envAdmobRewardedUnitId =
  process.env.EXPO_PUBLIC_ADMOB_REWARDED_UNIT_ID?.trim();

export const BASE_URL = trimTrailingSlash(envBaseUrl || fallbackBaseUrl);
export const SOCKET_NAMESPACE = ensureLeadingSlash(
  envSocketNamespace || "/api/chat",
);
export const SOCKET_URL = `${BASE_URL}${SOCKET_NAMESPACE}`;

export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ||
  "681858960345-ve9vanjcbhk293pj2niqnvme31m2kded.apps.googleusercontent.com";

export const ADMOB_INTERSTITIAL_UNIT_ID = envAdmobInterstitialUnitId || null;
export const ADMOB_REWARDED_UNIT_ID = envAdmobRewardedUnitId || null;

export const ONESIGNAL_APP_ID =
  process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID?.trim() || null;
