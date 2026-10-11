import type {
  CreatePromptPostPayload,
  CreatedPost,
  Prompt,
  PromptCategory,
} from "@/src/domain/posts/types";
import type { ProfilePostContent } from "@/src/domain/profile/types";
import appendNativeFile from "@/src/utils/appendNativeFile";
import apiClient from "@/src/service/api-client";

export const fetchPromptCategories = async () => {
  const response = await apiClient.get<PromptCategory[]>("/prompt/categories");
  return response.data;
};

export const fetchPromptsByCategories = async (category: string[]) => {
  const response = await apiClient.get<Prompt[]>(
    `/prompt/?category=${category.join(",")}`,
  );
  return response.data;
};

export const createPromptPost = async (post: CreatePromptPostPayload) => {
  const response = await apiClient.post<CreatedPost>("/post", post);
  return response.data;
};

export const createImagePost = async (params: {
  imageUri: string;
  caption?: string;
  visibility?: string;
}) => {
  const { imageUri, caption = "", visibility = "public" } = params;
  const formData = new FormData();
  formData.append("type", "IMAGE");
  formData.append("visibility", visibility);
  formData.append("content", JSON.stringify({ caption }));
  appendNativeFile(formData, "image", {
    uri: imageUri,
    name: "post-image.jpg",
    type: "image/jpeg",
  });

  const response = await apiClient.post("/post", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const createTextPost = async (post: {
  text: string;
  visibility?: string;
}) => {
  const payload = {
    type: "TEXT",
    visibility: post.visibility || "public",
    content: { text: post.text },
  };
  const response = await apiClient.post("/post", payload);
  return response.data;
};

export const updatePost = async (
  postId: string,
  payload: { content?: ProfilePostContent; visibility?: string },
) => {
  const response = await apiClient.put(`/post/${postId}`, payload);
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await apiClient.delete(`/post/${postId}`);
  return response.data;
};
