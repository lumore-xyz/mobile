import apiClient from "@/src/service/api-client";
import appendNativeFile from "@/src/utils/appendNativeFile";
import type { ChatRoom, RawChatMessage } from "@/src/domain/chat/types";
import type {
  InboxFilters,
  MatchRoomSummary,
} from "@/src/domain/chat/inboxTypes";
import type PaginatedResponse from "@/src/domain/api/PaginatedResponse";

export const fetchIbox = async (filters: InboxFilters | string = {}) => {
  const params = typeof filters === "string" ? { status: filters } : filters;
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.source) query.set("source", params.source);
  if (params.locationRoom) query.set("locationRoom", params.locationRoom);

  const search = query.toString();
  const response = await apiClient.get<MatchRoomSummary[]>(
    `/inbox${search ? `?${search}` : ""}`,
  );
  return response.data;
};

export const fetchIboxPage = async (
  filters: InboxFilters | string = {},
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<MatchRoomSummary>> => {
  const params = typeof filters === "string" ? { status: filters } : filters;
  const response = await apiClient.get<PaginatedResponse<MatchRoomSummary>>(
    "/inbox",
    {
      params: {
        ...params,
        unreadOnly: params.unreadOnly ? "true" : undefined,
        page,
        limit,
      },
    },
  );
  return response.data;
};

export const fetchRoomData = async (roomId: string) => {
  const response = await apiClient.get<ChatRoom>(`/inbox/${roomId}`);
  return response.data;
};

export const fetchRoomChat = async (roomId: string) => {
  const response = await apiClient.get<RawChatMessage[]>(`/messages/${roomId}`);
  return response.data;
};

export const submitChatFeedback = async (
  roomId: string,
  feedback: string,
  rating?: number,
) => {
  const response = await apiClient.post(`/inbox/${roomId}/feedback`, {
    feedback,
    rating,
  });
  return response.data;
};

export const reportChatUser = async (
  roomId: string,
  category: string,
  reason: string,
  details?: string,
) => {
  const response = await apiClient.post(`/inbox/${roomId}/report`, {
    category,
    reason,
    details,
  });
  return response.data;
};

export const uploadChatImage = async (roomId: string, imageUri: string) => {
  const formData = new FormData();
  appendNativeFile(formData, "image", {
    uri: imageUri,
    name: "chat-image.jpg",
    type: "image/jpeg",
  });
  const response = await apiClient.post(`/messages/${roomId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data as {
    message: string;
    imageUrl: string;
    imagePublicId: string;
  };
};

export const deleteTempChatImage = async (publicId: string) => {
  const response = await apiClient.delete("/messages/image-temp", {
    data: { publicId },
  });
  return response.data as { message: string };
};

const getAudioUploadMetadata = (audioUri: string) => {
  const extension = audioUri.split("?")[0]?.split(".").pop()?.toLowerCase();
  if (extension === "webm") {
    return { name: "voice-note.webm", type: "audio/webm" };
  }
  if (extension === "3gp") {
    return { name: "voice-note.3gp", type: "audio/3gpp" };
  }
  if (extension === "wav") {
    return { name: "voice-note.wav", type: "audio/wav" };
  }
  return { name: "voice-note.m4a", type: "audio/mp4" };
};

export const uploadChatAudio = async (
  roomId: string,
  audioUri: string,
  durationMs: number,
) => {
  const metadata = getAudioUploadMetadata(audioUri);
  const formData = new FormData();
  appendNativeFile(formData, "audio", {
    uri: audioUri,
    name: metadata.name,
    type: metadata.type,
  });
  formData.append("durationMs", String(Math.max(0, Math.round(durationMs))));

  const response = await apiClient.post(`/messages/${roomId}/audio`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data as {
    message: string;
    audioUrl: string;
    audioPublicId: string;
    audioDurationMs: number;
  };
};
