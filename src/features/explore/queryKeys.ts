export const exploreQueryKeys = {
  daily: (userId: string) => ["explore", "daily", userId] as const,
};
