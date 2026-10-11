import appendNativeFile from "@/src/utils/appendNativeFile";
import apiClient from "@/src/service/api-client";
import type {
  CommunityRoomSort,
  CommunityRoomTypeFilter,
  LocationPrediction,
  LocationRoomMember,
  LocationRoomSummary,
  LocationRoomUserState,
  SelectedLocation,
  StartLocationRoomMatchResult,
} from "@/src/features/community/types";

export type {
  CommunityRoomSort,
  CommunityRoomTypeFilter,
  LocationPrediction,
  LocationRoomMember,
  LocationRoomSummary,
  LocationRoomUserState,
  SelectedLocation,
  StartLocationRoomMatchResult,
} from "@/src/features/community/types";

const appendRoomCoverImage = (formData: FormData, imageUri?: string | null) => {
  const normalizedImageUri = String(imageUri || "").trim();
  if (!normalizedImageUri) return;

  const extension = normalizedImageUri
    .split("?")[0]
    ?.split(".")
    .pop()
    ?.toLowerCase();
  const metadata =
    extension === "png"
      ? { name: "room-cover.png", type: "image/png" }
      : extension === "webp"
        ? { name: "room-cover.webp", type: "image/webp" }
        : { name: "room-cover.jpg", type: "image/jpeg" };

  appendNativeFile(formData, "image", {
    uri: normalizedImageUri,
    name: metadata.name,
    type: metadata.type,
  });
};

export const fetchNearbyRooms = async (params: {
  latitude?: number | null;
  longitude?: number | null;
  radiusKm?: number;
  page?: number;
  limit?: number;
  search?: string;
  sort?: CommunityRoomSort;
  type?: CommunityRoomTypeFilter;
  nearby?: boolean;
  joinedOnly?: boolean;
  inPoolOnly?: boolean;
}) => {
  const response = await apiClient.get<{
    rooms: LocationRoomSummary[];
    page: number;
    hasMore: boolean;
    totalCount: number;
  }>("/rooms/nearby", {
    params: {
      latitude: params?.latitude ?? undefined,
      longitude: params?.longitude ?? undefined,
      radiusKm: params?.radiusKm ?? undefined,
      page: params.page ?? 0,
      limit: params.limit ?? 20,
      search: params.search || undefined,
      sort: params.sort || "pool_high",
      type: params.type || "all",
      nearby: params.nearby ? "true" : undefined,
      joinedOnly: params.joinedOnly ? "true" : undefined,
      inPoolOnly: params.inPoolOnly ? "true" : undefined,
    },
  });
  return response.data;
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
  type: "local" | "topic";
  description?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  formattedAddress?: string | null;
  imageUri?: string | null;
}) => {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("type", data.type);
  formData.append("description", data.description || "");
  formData.append("tags", JSON.stringify(data.tags || []));
  if (data.latitude != null && data.longitude != null) {
    formData.append("latitude", String(data.latitude));
    formData.append("longitude", String(data.longitude));
  }
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
    tags?: string[];
    imageUri?: string | null;
  },
) => {
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.description !== undefined) {
    formData.append("description", data.description);
  }
  if (data.tags !== undefined) {
    formData.append("tags", JSON.stringify(data.tags));
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

export const searchCommunityLocations = async (
  input: string,
  sessionToken: string,
) => {
  const response = await apiClient.post<{ predictions: LocationPrediction[] }>(
    "/rooms/location-search",
    { input, sessionToken },
  );
  return response.data.predictions;
};

export const getCommunityLocationDetails = async (
  placeId: string,
  sessionToken: string,
) => {
  const response = await apiClient.post<SelectedLocation>(
    "/rooms/location-details",
    { placeId, sessionToken },
  );
  return response.data;
};

export const reverseGeocodeCommunityLocation = async (
  latitude: number,
  longitude: number,
) => {
  const response = await apiClient.post<{ formattedAddress: string }>(
    "/rooms/location-reverse-geocode",
    { latitude, longitude },
  );
  return response.data.formattedAddress;
};
