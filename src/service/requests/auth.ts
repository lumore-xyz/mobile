import axios from "axios";
import { router } from "expo-router";
import { useCallback } from "react";
import { OneSignal } from "react-native-onesignal";
import apiClient from "../api-client";
import config from "../config";
import {
  getRefreshToken,
  removeAccessToken,
  removeRefreshToken,
  removeUser,
  setAccessToken,
  setRefreshToken,
  setUser,
} from "../storage";

type User = {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
};

type CredentialLoginPayload = {
  identifier: string;
  password: string;
};

type CredentialSignupPayload = {
  email: string;
  password: string;
};

const ONESIGNAL_EMAIL_ALIAS_LABEL = "custom_alias_label";

const syncOneSignalUser = (user: User) => {
  const externalId = user?._id || user?.id;
  if (!externalId) return;

  try {
    OneSignal.login(String(externalId));

    if (user?.email) {
      OneSignal.User.addAlias(ONESIGNAL_EMAIL_ALIAS_LABEL, user.email);
    }
  } catch (error) {
    console.warn("OneSignal user sync failed", error);
  }
};

export default function useAuth() {
  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<User> => {
      const { data } = await apiClient.post("/auth/google-signin", {
        id_token: idToken,
      });

      if (!data?.accessToken || !data?.refreshToken || !data?.user) {
        throw new Error("Invalid authentication response");
      }

      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);
      syncOneSignalUser(data.user);

      return data.user;
    },
    [],
  );

  const loginWithCredentials = useCallback(
    async ({ identifier, password }: CredentialLoginPayload): Promise<User> => {
      const payload = {
        identifier: String(identifier || "").trim(),
        password,
      };

      if (!payload.identifier || !payload.password) {
        throw new Error("Identifier and password are required");
      }

      const { data } = await apiClient.post("/auth/login", payload);

      if (!data?.accessToken || !data?.refreshToken || !data?.user) {
        throw new Error("Invalid authentication response");
      }

      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);
      syncOneSignalUser(data.user);

      return data.user;
    },
    [],
  );

  const signupWithCredentials = useCallback(
    async ({ email, password }: CredentialSignupPayload): Promise<User> => {
      const payload = {
        email: String(email || "").trim().toLowerCase(),
        password,
      };

      if (!payload.email || !payload.password) {
        throw new Error("Email and password are required");
      }

      const { data } = await apiClient.post("/auth/signup", payload);

      if (!data?.accessToken || !data?.refreshToken || !data?.user) {
        throw new Error("Invalid authentication response");
      }

      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);
      syncOneSignalUser(data.user);

      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      OneSignal.logout();
    } catch (error) {
      console.warn("OneSignal logout failed", error);
    }
    removeAccessToken();
    removeRefreshToken();
    removeUser();
    router.replace("/login");
  }, []);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token found");
      }

      const { data } = await axios.post(`${config.BASE_URL}/api/auth/refresh-token`, {
        refreshToken,
      });

      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        return true;
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (error) {
      console.error("Token refresh failed", error);
      logout();
      return false;
    }
  }, [logout]);

  return {
    loginWithGoogle,
    loginWithCredentials,
    signupWithCredentials,
    logout,
    refreshTokens,
  };
}
