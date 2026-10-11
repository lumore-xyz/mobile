import apiClient from "@/src/service/api-client";

export const fetchCreditsBalance = async () => {
  const response = await apiClient.get("/credits/balance");
  return response.data;
};

export const fetchCreditsHistory = async (params?: {
  page?: number;
  limit?: number;
}) => {
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const response = await apiClient.get(
    `/credits/history?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const claimDailyCredits = async () => {
  const response = await apiClient.post("/credits/daily-claim");
  return response.data;
};

export const claimRewardedAdCredit = async (payload: { claimId: string }) => {
  const response = await apiClient.post("/credits/rewarded-ad-claim", payload);
  return response.data;
};
