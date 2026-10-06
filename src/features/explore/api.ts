import apiClient from "@/src/service/api-client";
import { getRetryAfterMs } from "./state";

export interface ExploreProfile {
  _id: string;
  nickname?: string;
  profilePicture?: string;
  age?: number;
  gender?: string;
  distanceKm?: number | null;
  bio?: string;
  interests?: string[];
  languages?: string[];
  isVerified?: boolean;
  score: number;
  matchNote: string;
  noteStatus: "generated" | "fallback";
}

export interface DailyExplore {
  dailyId: string | null;
  dayKey: string;
  resetAt: string;
  cost: number;
  refreshCost: number;
  amountPaid: number;
  unlocked: boolean;
  status: "locked" | "generating" | "ready" | "empty";
  candidateCount: number;
  profiles: ExploreProfile[];
  retryAfterMs: number;
}

type ExploreEnvelope = {
  success: boolean;
  data: Omit<DailyExplore, "retryAfterMs">;
};

export const fetchDailyExplore = async (
  signal?: AbortSignal,
): Promise<DailyExplore> => {
  const response = await apiClient.get<ExploreEnvelope>("/explore", {
    signal,
    timeout: 20000,
  });
  return {
    ...response.data.data,
    retryAfterMs: getRetryAfterMs(response.headers["retry-after"]),
  };
};

export const unlockDailyExplore = async (): Promise<DailyExplore> => {
  const response = await apiClient.post<ExploreEnvelope>(
    "/explore/unlock",
    {},
    { timeout: 30000 },
  );
  return {
    ...response.data.data,
    retryAfterMs: getRetryAfterMs(response.headers["retry-after"]),
  };
};

export const forceRefreshDailyExplore = async (
  requestId: string,
): Promise<DailyExplore> => {
  const response = await apiClient.post<ExploreEnvelope>(
    "/explore/refresh",
    { requestId },
    { timeout: 30000 },
  );
  return {
    ...response.data.data,
    retryAfterMs: getRetryAfterMs(response.headers["retry-after"]),
  };
};

export const startExploreConversation = async (profileId: string) => {
  const response = await apiClient.post<{
    success: boolean;
    data: { roomId: string };
  }>(
    `/explore/profiles/${encodeURIComponent(profileId)}/conversation`,
    {},
    { timeout: 20000 },
  );
  return response.data.data;
};

export interface RejectExploreProfileInput {
  reason: string;
  feedback?: string;
}

export const rejectExploreProfile = async (
  profileId: string,
  input: RejectExploreProfileInput,
) => {
  const response = await apiClient.post<{
    success: boolean;
    data: { profileId: string };
  }>(`/explore/profiles/${encodeURIComponent(profileId)}/reject`, input, {
    timeout: 20000,
  });
  return response.data.data;
};

export interface ProfileCompatibility {
  score: number;
  components: {
    distance: number;
    goals: number;
    interests: number;
    thisOrThat: number;
  };
}

export const fetchProfileCompatibility = async (
  profileId: string,
): Promise<ProfileCompatibility> => {
  const response = await apiClient.get<{
    success: boolean;
    data: ProfileCompatibility;
  }>(`/explore/profiles/${encodeURIComponent(profileId)}/compatibility`, {
    timeout: 20000,
  });
  return response.data.data;
};
