import apiClient from "@/src/service/api-client";

export const fetchReferralSummary = async () => {
  const response = await apiClient.get("/referral/summary");
  return response.data;
};

export const applyReferralCode = async (code: string) => {
  const response = await apiClient.post("/referral/apply", { code });
  return response.data;
};
