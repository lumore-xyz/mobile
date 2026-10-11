import apiClient from "@/src/service/api-client";

export const startHaloKycVerification = async () => {
  const response = await apiClient.post("/halokyc/create-verification", {});
  return response.data;
};
