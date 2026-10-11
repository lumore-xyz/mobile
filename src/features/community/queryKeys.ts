import type { CommunityRoomSort, CommunityRoomTypeFilter } from "./types";

interface CommunityDirectoryKeyParams {
  search: string;
  type: CommunityRoomTypeFilter;
  nearby: boolean;
  sort: CommunityRoomSort;
  latitude: number | null;
  longitude: number | null;
  joinedOnly: boolean;
  inPoolOnly: boolean;
}

export const communityQueryKeys = {
  all: ["rooms"] as const,
  detail: (roomId: string) => ["rooms", roomId] as const,
  directory: ({
    search,
    type,
    nearby,
    sort,
    latitude,
    longitude,
    joinedOnly,
    inPoolOnly,
  }: CommunityDirectoryKeyParams) =>
    [
      "rooms",
      "directory",
      search,
      type,
      nearby,
      sort,
      latitude,
      longitude,
      joinedOnly,
      inPoolOnly,
    ] as const,
};
