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
  tags?: string[];
  type?: "local" | "topic";
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

export interface StartLocationRoomMatchResult {
  roomId: string;
  nextMatchAt?: string | null;
  matchCount: number;
  matchedUserCount: number;
  skippedUserCount: number;
}

export type CommunityRoomSort = "pool_high" | "pool_low" | "newest" | "nearest";
export type CommunityRoomTypeFilter = "all" | "local" | "topic";

export interface LocationPrediction {
  placeId: string;
  description: string;
  primaryText: string;
  secondaryText: string;
}

export interface SelectedLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}
