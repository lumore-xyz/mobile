export const creditsQueryKeys = {
  all: ["credits"] as const,
  balance: ["credits", "balance"] as const,
  balanceForUser: (userId: string) => ["credits", "balance", userId] as const,
  history: ["credits", "history"] as const,
  historyPage: (page: number) => ["credits", "history", page] as const,
};
