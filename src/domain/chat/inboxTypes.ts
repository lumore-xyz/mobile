export type InboxTab = "active" | "archive";

export type InboxSort =
  | "recent"
  | "oldest"
  | "compatibility_desc"
  | "compatibility_asc"
  | "nearest"
  | "farthest";

export interface InboxFiltersState {
  search: string;
  unreadOnly: boolean;
  sort: InboxSort;
}

export interface InboxFilters {
  status?: string;
  source?: string;
  locationRoom?: string;
  search?: string;
  unreadOnly?: boolean;
  sort?: string;
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
  lastMessage?: {
    message?: string;
    messageType?: "text" | "image" | "audio";
    previewType?: "text" | "image" | "audio";
  } | null;
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
