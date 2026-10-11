export const inboxQueryKeys = {
  all: ["inbox"] as const,
  active: ["inbox", "active"] as const,
  archived: ["inbox", "archive"] as const,
  locationRoomActive: (roomId: string) =>
    ["inbox", "location_room", roomId, "active"] as const,
  activeList: <TFilters>(filters: TFilters) =>
    ["inbox", "active", filters] as const,
  archivedList: <TFilters>(filters: TFilters) =>
    ["inbox", "archive", filters] as const,
};
