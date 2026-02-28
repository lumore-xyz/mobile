import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV();

export const setAccessToken = (token: string) => {
  storage.set("accessToken", token);
};

export const getAccessToken = () => {
  return storage.getString("accessToken");
};

export const removeAccessToken = () => {
  storage.remove("accessToken");
};

export const setRefreshToken = (token: string) => {
  storage.set("refreshToken", token);
};

export const getRefreshToken = () => {
  return storage.getString("refreshToken");
};

export const removeRefreshToken = () => {
  storage.remove("refreshToken");
};
export const setUser = (user: any) => {
  storage.set("user", JSON.stringify(user));
};

export const getUser = () => {
  return JSON.parse(storage.getString("user") || "{}");
};

export const removeUser = () => {
  storage.remove("user");
};

export const setIsOnboarded = (userId: string, isOnboarded: boolean) => {
  storage.set(`isOnboarded-${userId}`, isOnboarded.toString());
};

export const getIsOnboarded = (userId: string): boolean | null => {
  return storage.getString(`isOnboarded-${userId}`) ? true : false;
};

const PENDING_REFERRAL_CODE_KEY = "pendingReferralCode";

export const setPendingReferralCode = (code: string) => {
  const normalized = String(code || "").trim();
  if (!normalized) return;
  storage.set(PENDING_REFERRAL_CODE_KEY, normalized);
};

export const getPendingReferralCode = (): string | null => {
  return storage.getString(PENDING_REFERRAL_CODE_KEY) || null;
};

export const removePendingReferralCode = () => {
  storage.remove(PENDING_REFERRAL_CODE_KEY);
};
