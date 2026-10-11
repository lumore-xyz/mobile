import apiClient from "@/src/service/api-client";

export const fetchPublicOptions = async () => {
  const response = await apiClient.get("/status/options");
  return response.data;
};
