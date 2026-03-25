import axios from "axios";
import config from "./config";
import { getAccessToken, getRefreshToken, setAccessToken } from "./storage";

const resolveApiBaseUrl = () => `${config.BASE_URL}/api`;

const apiClient = axios.create();

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
    const originalRequest = error?.config;

    if ((status === 401 || status === 403) && originalRequest) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${config.BASE_URL}/api/auth/refresh-token`,
          {
            refreshToken,
          },
        );

        if (!data?.accessToken) {
          return Promise.reject(error);
        }

        setAccessToken(data.accessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        originalRequest.baseURL = resolveApiBaseUrl();
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
