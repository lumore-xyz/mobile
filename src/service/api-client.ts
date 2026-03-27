import axios from "axios";
import { refreshAccessToken } from "./auth-session";
import config from "./config";
import { clearSession, getAccessToken, getRefreshToken } from "./storage";

const resolveApiBaseUrl = () => `${config.BASE_URL}/api`;

const apiClient = axios.create();

type RetryableRequestConfig = {
  _retry?: boolean;
  baseURL?: string;
  headers?: Record<string, string>;
  url?: string;
};

const isRefreshRequest = (url?: string) =>
  Boolean(url?.includes("/auth/refresh-token"));

apiClient.interceptors.request.use(
  (requestConfig) => {
    requestConfig.baseURL = resolveApiBaseUrl();

    const token = getAccessToken();
    if (token) {
      requestConfig.headers = (requestConfig.headers || {}) as any;
      (requestConfig.headers as any).Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = Number(error?.response?.status || 0);
    const originalRequest = error?.config as RetryableRequestConfig | undefined;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest(originalRequest.url)
    ) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearSession();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      const nextAccessToken = await refreshAccessToken();
      if (!nextAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      originalRequest.baseURL = resolveApiBaseUrl();
      return apiClient(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
