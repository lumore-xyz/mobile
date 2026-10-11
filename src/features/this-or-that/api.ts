import appendNativeFile from "@/src/utils/appendNativeFile";
import apiClient from "@/src/service/api-client";

export const fetchThisOrThatQuestions = async (limit = 20) => {
  const response = await apiClient.get(
    `/games/this-or-that/questions?limit=${limit}`,
  );
  return response.data;
};

export const fetchUserThisOrThatAnswers = async (params: {
  userId: string;
  page?: number;
  limit?: number;
}) => {
  const { userId, page = 1, limit = 10 } = params;
  const response = await apiClient.get(
    `/games/this-or-that/answers/${userId}?page=${page}&limit=${limit}`,
  );
  return response.data;
};

export const submitThisOrThatAnswer = async (params: {
  questionId: string;
  selection: "left" | "right";
}) => {
  const response = await apiClient.post(
    "/games/this-or-that/answers",
    params,
  );
  return response.data;
};

export const submitThisOrThatQuestion = async (payload: {
  leftOption: string;
  leftImageUri: string;
  rightOption: string;
  rightImageUri: string;
  category?: string;
}) => {
  const formData = new FormData();
  formData.append("leftOption", payload.leftOption);
  formData.append("rightOption", payload.rightOption);
  if (payload.category) formData.append("category", payload.category);
  appendNativeFile(formData, "leftImage", {
    uri: payload.leftImageUri,
    name: "left-image.jpg",
    type: "image/jpeg",
  });
  appendNativeFile(formData, "rightImage", {
    uri: payload.rightImageUri,
    name: "right-image.jpg",
    type: "image/jpeg",
  });

  const response = await apiClient.post(
    "/games/this-or-that/questions",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};
