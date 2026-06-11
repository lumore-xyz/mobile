import axios from "axios";
import apiClient from "../service/api-client";
import { getUser } from "../service/storage";

/* -------------------------------------------------------------------------- */
/*                              External API Call                             */
/* -------------------------------------------------------------------------- */
export const getFormattedAddress = async (lat: number, lng: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const response = await axios.get(url, {
    headers: { "User-Agent": "Lumore/1.0" }, // Required by OSM
  });
  return response.data.display_name || null;
};

export interface LocationWritePayload {
  latitude: number;
  longitude: number;
  formattedAddress?: string | null;
}

export interface LocationRoomUserState {
  isPinned: boolean;
  inPool: boolean;
  poolStatus: string;
  lastMatchedAt?: string | null;
  lastMatchedCycle?: string | null;
  lastMatchRoom?: string | null;
  lastPoolError?: string;
}

export interface LocationRoomSummary {
  _id: string;
  title: string;
  description?: string;
  creator?: string | { _id?: string };
  imageUrl?: string;
  location?: {
    type: "Point";
    coordinates: number[];
    formattedAddress?: string;
  };
  distanceKm?: number | null;
  nextMatchAt?: string;
  secondsUntilNextMatch?: number;
  pinnedCount?: number;
  poolCount?: number;
  userState?: LocationRoomUserState;
}

export interface LocationRoomMember {
  _id: string;
  username?: string;
  nickname?: string;
  profilePicture?: string;
  dob?: string | null;
  gender?: string;
}

export interface MatchRoomParticipantSummary {
  _id: string;
  username?: string;
  nickname?: string;
  profilePicture?: string;
}

export interface MatchRoomSummary {
  _id: string;
  participants?: MatchRoomParticipantSummary[];
  source?: "explore" | "location_room";
  locationRoom?:
    | string
    | {
        _id?: string;
        title?: string;
      }
    | null;
  sourceMetadata?: {
    title?: string;
    subtitle?: string;
  };
  status?: "active" | "archive";
  lastMessageAt?: string;
  unreadCount?: number;
}

const getImageUploadMetadata = (imageUri: string) => {
  const extension = imageUri.split("?")[0]?.split(".").pop()?.toLowerCase();
  if (extension === "png") {
    return { name: "room-cover.png", type: "image/png" };
  }
  if (extension === "webp") {
    return { name: "room-cover.webp", type: "image/webp" };
  }
  return { name: "room-cover.jpg", type: "image/jpeg" };
};

const appendRoomCoverImage = (formData: FormData, imageUri?: string | null) => {
  const normalizedImageUri = String(imageUri || "").trim();
  if (!normalizedImageUri) return;

  const metadata = getImageUploadMetadata(normalizedImageUri);
  formData.append("image", {
    uri: normalizedImageUri,
    name: metadata.name,
    type: metadata.type,
  } as any);
};

export interface StartLocationRoomMatchResult {
  roomId: string;
  nextMatchAt?: string | null;
  matchCount: number;
  matchedUserCount: number;
  skippedUserCount: number;
}

/* -------------------------------------------------------------------------- */
/*                               Auth & Profile                               */
/* -------------------------------------------------------------------------- */
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

export const updateUserData = async (data: any) => {
  const { _id: userId } = getUser();
  const response = await apiClient.patch(`/profile/${userId}`, data);
  return response.data;
};
export const updateUserLocation = async (data: LocationWritePayload) => {
  const { _id: userId } = getUser();
  const response = await apiClient.post(`/profile/${userId}/update-location`, {
    latitude: data.latitude,
    longitude: data.longitude,
    formattedAddress: data.formattedAddress || undefined,
  });
  return response.data;
};
export const findNearbyUsers = async () => {
  const { _id: userId } = getUser();
  const response = await apiClient.get(`/profile/${userId}/nearby`);
  return response.data;
};

export const updateFieldVisibility = async (
  userId: string,
  field: string,
  visibility: string,
) => {
  const response = await apiClient.patch(`/profile/${userId}/visibility`, {
    fields: { [field]: visibility },
  });
  return response.data;
};

export const updateUserPreferences = async (data: any) => {
  const { _id: userId } = getUser();
  const response = await apiClient.patch(
    `/profile/${userId}/preferences`,
    data,
  );
  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                                   Slots                                    */
/* -------------------------------------------------------------------------- */
export const fetchUserSlots = async () => {
  const response = await apiClient.get("/slots");
  return response.data.data.slots;
};

export const createSlot = async () => {
  const response = await apiClient.post("/slots", {});
  return response.data.data.slot;
};

export const updateSlot = async (
  slotId: string,
  data: { profile?: string; roomId?: string },
) => {
  const response = await apiClient.patch(`/slots/${slotId}`, data);
  return response.data.data.slot;
};

/* -------------------------------------------------------------------------- */
/*                                   Rooms                                    */
/* -------------------------------------------------------------------------- */
export const fetchNearbyRooms = async (params?: {
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number;
}) => {
  const response = await apiClient.get<{ rooms: LocationRoomSummary[] }>(
    "/rooms/nearby",
    {
      params: {
        latitude: params?.latitude ?? undefined,
        longitude: params?.longitude ?? undefined,
        radiusKm: params?.radiusKm ?? undefined,
      },
    },
  );
  return response.data.rooms;
};

export const fetchLocationRoomDetail = async (roomId: string) => {
  const response = await apiClient.get<{
    room: LocationRoomSummary;
    members: LocationRoomMember[];
    userState: LocationRoomUserState;
  }>(`/rooms/${roomId}`);
  return response.data;
};

export const createLocationRoom = async (data: {
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  formattedAddress?: string | null;
  imageUri?: string | null;
}) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description || "");
  formData.append("latitude", String(data.latitude));
  formData.append("longitude", String(data.longitude));
  if (data.formattedAddress) {
    formData.append("formattedAddress", data.formattedAddress);
  }
  appendRoomCoverImage(formData, data.imageUri);

  const response = await apiClient.post<{
    room: LocationRoomSummary;
    userState: LocationRoomUserState;
  }>("/rooms", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateLocationRoom = async (
  roomId: string,
  data: {
    title?: string;
    description?: string;
    imageUri?: string | null;
  },
) => {
  const formData = new FormData();
  if (data.title !== undefined) {
    formData.append("title", data.title);
  }
  if (data.description !== undefined) {
    formData.append("description", data.description);
  }
  appendRoomCoverImage(formData, data.imageUri);

  const response = await apiClient.patch<{
    room: LocationRoomSummary;
    userState: LocationRoomUserState;
  }>(`/rooms/${roomId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const followLocationRoom = async (roomId: string) => {
  const response = await apiClient.post<{ userState: LocationRoomUserState }>(
    `/rooms/${roomId}/pin`,
  );
  return response.data;
};

export const rejoinLocationRoom = async (roomId: string) => {
  const response = await apiClient.post<{ userState: LocationRoomUserState }>(
    `/rooms/${roomId}/rejoin`,
  );
  return response.data;
};

export const leaveLocationRoomPool = async (roomId: string) => {
  const response = await apiClient.post<{ userState: LocationRoomUserState }>(
    `/rooms/${roomId}/leave-pool`,
  );
  return response.data;
};

export const unfollowLocationRoom = async (roomId: string) => {
  const response = await apiClient.post<{ userState: LocationRoomUserState }>(
    `/rooms/${roomId}/unpin`,
  );
  return response.data;
};

export const startLocationRoomMatchNow = async (roomId: string) => {
  const response = await apiClient.post<StartLocationRoomMatchResult>(
    `/rooms/${roomId}/start-match`,
  );
  return response.data;
};
/* -------------------------------------------------------------------------- */
/*                                   Inbox                                    */
/* -------------------------------------------------------------------------- */
export interface InboxFilters {
  status?: string;
  source?: string;
  locationRoom?: string;
}

export const fetchIbox = async (filters: InboxFilters | string = {}) => {
  const params: InboxFilters =
    typeof filters === "string" ? { status: filters } : filters;

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
export const fetchRoomData = async (roomId: string) => {
  const response = await apiClient.get(`/inbox/${roomId}`);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                               Account Actions                              */
/* -------------------------------------------------------------------------- */
export const deleteAccount = async () => {
  const { _id: userId } = getUser();
  const response = await apiClient.delete(`/profile/${userId}`);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                               File Upload                                  */
/* -------------------------------------------------------------------------- */
export interface UploadResponse {
  message: string;
  profilePicture: string;
}

export interface RNFilePayload {
  uri: string;
  name: string;
  type: string;
}

export const uploadProfilePicture = async (
  file: File | RNFilePayload,
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("profilePic", file as any);

  const { _id: userId } = getUser();

  const res = await apiClient.patch<UploadResponse>(
    `/profile/${userId}/update-profile-picture`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return res.data;
};

/* -------------------------------------------------------------------------- */
/*                                  Messages                                  */
/* -------------------------------------------------------------------------- */
export const fetchRoomChat = async (roomId: string) => {
  const response = await apiClient.get(`/messages/${roomId}`);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                                 Moderation                                 */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/*                                  App Status                                */
/* -------------------------------------------------------------------------- */
export const fetchAppStatus = async () => {
  const response = await apiClient.get(`/status/app-status`);
  return response.data;
};
export const fetchPublicOptions = async () => {
  const response = await apiClient.get(`/status/options`);
  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                           Push Notification                                */
/* -------------------------------------------------------------------------- */
export const subscribePushService = async (subscription: PushSubscription) => {
  const response = await apiClient.post(`/push/subscribe`, {
    subscription: JSON.parse(JSON.stringify(subscription)),
  });
  return response.data;
};
export const unsubscribePushService = async (endpoint: string) => {
  const response = await apiClient.post(`/push/unsubscribe`, {
    endpoint,
  });
  return response.data;
};

/* -------------------------------------------------------------------------- */
/*                                Prompt                                      */
/* -------------------------------------------------------------------------- */
export const fetchPromptCategories = async () => {
  const response = await apiClient.get(`/prompt/categories`);
  return response.data;
};
export const fetchPromptsByCategories = async (category: string[]) => {
  const response = await apiClient.get(
    `/prompt/?category=${category.join(",")}`,
  );
  return response.data;
};
/* -------------------------------------------------------------------------- */
/*                                Posts                                       */
/* -------------------------------------------------------------------------- */
export const createPromptPost = async (post: any) => {
  const response = await apiClient.post(`/post`, post);
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
  formData.append("image", {
    uri: imageUri,
    name: "post-image.jpg",
    type: "image/jpeg",
  } as any);

  const response = await apiClient.post(`/post`, formData, {
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
  const response = await apiClient.post(`/post`, payload);
  return response.data;
};

export const updatePost = async (
  postId: string,
  payload: { content?: any; visibility?: string },
) => {
  const response = await apiClient.put(`/post/${postId}`, payload);
  return response.data;
};

export const deletePost = async (postId: string) => {
  const response = await apiClient.delete(`/post/${postId}`);
  return response.data;
};
/* -------------------------------------------------------------------------- */
/*                               Verification                                 */
/* -------------------------------------------------------------------------- */
export const startDiditVerification = async () => {
  const response = await apiClient.post("/didit/create-verification", {});
  return response.data;
};
/* -------------------------------------------------------------------------- */
/*                                  App Status                                */
/* -------------------------------------------------------------------------- */
export const fetchPreferenceMatchCount = async () => {
  const response = await apiClient.get(`/status/match-available-count`);
  return response.data;
};
/* -------------------------------------------------------------------------- */
/*                                  Credits                                   */
/* -------------------------------------------------------------------------- */
export const fetchCreditsBalance = async () => {
  const response = await apiClient.get(`/credits/balance`);
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
  const response = await apiClient.post(`/credits/daily-claim`);
  return response.data;
};

export const claimRewardedAdCredit = async (payload: { claimId: string }) => {
  const response = await apiClient.post(`/credits/rewarded-ad-claim`, payload);
  return response.data;
};
/* -------------------------------------------------------------------------- */
/*                                 Referral                                   */
/* -------------------------------------------------------------------------- */
export const fetchReferralSummary = async () => {
  const response = await apiClient.get(`/referral/summary`);
  return response.data;
};

export const applyReferralCode = async (code: string) => {
  const response = await apiClient.post(`/referral/apply`, { code });
  return response.data;
};
/* -------------------------------------------------------------------------- */
/*                               This Or That                                 */
/* -------------------------------------------------------------------------- */
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
  const response = await apiClient.post(`/games/this-or-that/answers`, params);
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
  if (payload.category) {
    formData.append("category", payload.category);
  }
  formData.append("leftImage", {
    uri: payload.leftImageUri,
    name: "left-image.jpg",
    type: "image/jpeg",
  } as any);
  formData.append("rightImage", {
    uri: payload.rightImageUri,
    name: "right-image.jpg",
    type: "image/jpeg",
  } as any);
  const response = await apiClient.post(
    `/games/this-or-that/questions`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data;
};
/* -------------------------------------------------------------------------- */
/*                                 Moderation                                 */
/* -------------------------------------------------------------------------- */
export const fetchReceivedFeedbacks = async () => {
  const response = await apiClient.get(`/inbox/feedback/received`);
  return response.data;
};
/* -------------------------------------------------------------------------- */
/*                                  Messages                                  */
/* -------------------------------------------------------------------------- */
export const uploadChatImage = async (roomId: string, imageUri: string) => {
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    name: "chat-image.jpg",
    type: "image/jpeg",
  } as any);
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
  const response = await apiClient.delete(`/messages/image-temp`, {
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
  formData.append("audio", {
    uri: audioUri,
    name: metadata.name,
    type: metadata.type,
  } as any);
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

export const deleteTempChatAudio = async (publicId: string) => {
  const response = await apiClient.delete(`/messages/audio-temp`, {
    data: { publicId },
  });
  return response.data as { message: string };
};

/* -------------------------------------------------------------------------- */
/*                                  Posts                                     */
/* -------------------------------------------------------------------------- */
export const getPostById = async (postId: string) => {
  const response = await apiClient.get(`/post/${postId}`);
  return response.data;
};
