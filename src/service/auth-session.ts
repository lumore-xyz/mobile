import axios from "axios";
import { jwtDecode } from "jwt-decode";
import config from "./config";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getUser,
  setAccessToken,
} from "./storage";

type DecodedToken = {
  exp?: number;
};

let refreshRequest: Promise<string | null> | null = null;

export const isTokenExpired = (
  token: string | null | undefined,
  skewSeconds = 30,
) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded?.exp) {
      return false;
    }

    const currentTime = Date.now() / 1000;
    return decoded.exp <= currentTime + skewSeconds;
  } catch {
    return true;
  }
};

export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshRequest) {
    return refreshRequest;
  }

  refreshRequest = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      return null;
    }

    try {
      const { data } = await axios.post(`${config.BASE_URL}/api/auth/refresh-token`, {
        refreshToken,
      });
      const nextAccessToken =
        typeof data?.accessToken === "string" ? data.accessToken : null;

      if (!nextAccessToken) {
        throw new Error("Invalid refresh response");
      }

      setAccessToken(nextAccessToken);
      return nextAccessToken;
    } catch (error) {
      console.error("Token refresh failed", error);
      clearSession();
      return null;
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
};

export const bootstrapAuthSession = async () => {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  const user = getUser();

  if (!user?._id) {
    clearSession();
    return false;
  }

  if (accessToken && !isTokenExpired(accessToken)) {
    return true;
  }

  if (!refreshToken || isTokenExpired(refreshToken)) {
    clearSession();
    return false;
  }

  const nextAccessToken = await refreshAccessToken();
  return Boolean(nextAccessToken && getUser()?._id);
};
