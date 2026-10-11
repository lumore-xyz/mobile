import appendNativeFile, {
  type RNFilePayload,
} from "@/src/utils/appendNativeFile";
import apiClient from "@/src/service/api-client";
import { getUser } from "@/src/service/storage";
import type {
  ProfilePost,
  ProfileUser,
  UserPreferences,
} from "@/src/domain/profile/types";

export const fetchUserPosts = async (userId: string): Promise<ProfilePost[]> => {
  const { data } = await apiClient.get<ProfilePost[]>(`/post/${userId}`);
  return data;
};

export const fetchUserPreferences = async (
  userId: string,
): Promise<UserPreferences> => {
  const { data } = await apiClient.get<UserPreferences>(
    `/profile/${userId}/preferences`,
  );
  return data;
};

export const fetchUser = async (userId: string): Promise<ProfileUser> => {
  const { data } = await apiClient.get<ProfileUser>(`/profile/${userId}`);
  return data;
};

export const updateUserField = async ({
  userId,
  field,
  value,
}: {
  userId: string;
  field: string;
  value: unknown;
}) => {
  const response = await apiClient.patch(`/profile/${userId}`, {
    [field]: value,
  });
  return response.data;
};

export const updateFieldVisibility = async ({
  userId,
  field,
  visibility,
}: {
  userId: string;
  field: string;
  visibility: string;
}) => {
  const response = await apiClient.patch(`/profile/${userId}/visibility`, {
    fields: { [field]: visibility },
  });
  return response.data;
};

export const updateUserData = async (data: object): Promise<unknown> => {
  const { _id: userId } = getUser();
  const response = await apiClient.patch<unknown>(`/profile/${userId}`, data);
  return response.data;
};

export const updateUserPreferences = async (data: object): Promise<unknown> => {
  const { _id: userId } = getUser();
  const response = await apiClient.patch<unknown>(
    `/profile/${userId}/preferences`,
    data,
  );
  return response.data;
};

export const deleteAccount = async () => {
  const { _id: userId } = getUser();
  const response = await apiClient.delete(`/profile/${userId}`);
  return response.data;
};

export interface UploadResponse {
  message: string;
  profilePicture: string;
}

export const uploadProfilePicture = async (
  file: File | RNFilePayload,
): Promise<UploadResponse> => {
  const formData = new FormData();
  if ("uri" in file) {
    appendNativeFile(formData, "profilePic", file);
  } else {
    formData.append("profilePic", file);
  }

  const { _id: userId } = getUser();
  const response = await apiClient.patch<UploadResponse>(
    `/profile/${userId}/update-profile-picture`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};
