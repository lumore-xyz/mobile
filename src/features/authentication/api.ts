import apiClient from "@/src/service/api-client";

export const setNewPassword = async (data: { newPassword: string }) => {
  const response = await apiClient.post("/auth/set-password", data);
  return response.data;
};

export const requestPasswordResetEmail = async (email: string) => {
  const response = await apiClient.post("/auth/forgot-password", {
    email: String(email || "")
      .trim()
      .toLowerCase(),
  });
  return response.data as { message: string };
};

export const resetPasswordWithToken = async (data: {
  token: string;
  newPassword: string;
}) => {
  const response = await apiClient.post("/auth/reset-password", {
    token: String(data?.token || "").trim(),
    newPassword: data?.newPassword || "",
  });
  return response.data as { message: string };
};

export const checkUsernameAvailability = async (username: string) => {
  const normalizedUsername = String(username || "").trim();
  const response = await apiClient.get(
    `/auth/check-username/${encodeURIComponent(normalizedUsername)}`,
  );
  return Boolean(response.data.isUnique);
};
