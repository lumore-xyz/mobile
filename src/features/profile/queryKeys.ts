export const profileQueryKeys = {
  user: (userId: string) => ["user", userId] as const,
  posts: (userId: string) => ["user posts", userId] as const,
  preferences: (userId: string) => ["user-profile", userId] as const,
};
