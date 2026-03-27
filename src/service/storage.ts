import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV();
export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";
export const USER_KEY = "user";

export const setAccessToken = (token: string) => {
  storage.set(ACCESS_TOKEN_KEY, token);
};

export const getAccessToken = () => {
  return storage.getString(ACCESS_TOKEN_KEY);
};

export const removeAccessToken = () => {
  storage.remove(ACCESS_TOKEN_KEY);
};

export const setRefreshToken = (token: string) => {
  storage.set(REFRESH_TOKEN_KEY, token);
};

export const getRefreshToken = () => {
  return storage.getString(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = () => {
  storage.remove(REFRESH_TOKEN_KEY);
};
export const setUser = (user: any) => {
  storage.set(USER_KEY, JSON.stringify(user));
};

export const getUser = () => {
  return JSON.parse(storage.getString(USER_KEY) || "{}");
};

export const removeUser = () => {
  storage.remove(USER_KEY);
};

export const setSession = ({
  accessToken,
  refreshToken,
  user,
}: {
  accessToken?: string;
  refreshToken?: string;
  user?: any;
}) => {
  if (accessToken) {
    setAccessToken(accessToken);
  }
  if (refreshToken) {
    setRefreshToken(refreshToken);
  }
  if (user) {
    setUser(user);
  }
};

export const clearSession = () => {
  removeAccessToken();
  removeRefreshToken();
  removeUser();
};

export const setIsOnboarded = (userId: string, isOnboarded: boolean) => {
  storage.set(`isOnboarded-${userId}`, isOnboarded.toString());
};

export const getIsOnboarded = (userId: string): boolean | null => {
  return storage.getString(`isOnboarded-${userId}`) ? true : false;
};

const PENDING_REFERRAL_CODE_KEY = "pendingReferralCode";
const INSTALL_REFERRER_PROCESSED_KEY = "installReferrerProcessed";

export const setPendingReferralCode = (code: string) => {
  const normalized = String(code || "").trim();
  if (!normalized) return;
  storage.set(PENDING_REFERRAL_CODE_KEY, normalized);
};

export const capturePendingReferralCode = (code: string) => {
  const normalized = String(code || "").trim();
  if (!normalized || getPendingReferralCode()) return;
  storage.set(PENDING_REFERRAL_CODE_KEY, normalized);
};

export const getPendingReferralCode = (): string | null => {
  return storage.getString(PENDING_REFERRAL_CODE_KEY) || null;
};

export const removePendingReferralCode = () => {
  storage.remove(PENDING_REFERRAL_CODE_KEY);
};

export const getInstallReferrerProcessed = () => {
  return storage.getString(INSTALL_REFERRER_PROCESSED_KEY) === "1";
};

export const setInstallReferrerProcessed = () => {
  storage.set(INSTALL_REFERRER_PROCESSED_KEY, "1");
};
