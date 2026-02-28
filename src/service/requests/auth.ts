import axios from "axios";
import { router } from "expo-router";
import { useCallback } from "react";
import apiClient from "../api-client";
import { BASE_URL } from "../config";
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
  id: string;
  name: string;
  email: string;
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

      return data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
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

      const { data } = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
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
    logout,
    refreshTokens,
  };
}
