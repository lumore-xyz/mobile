export const thisOrThatQueryKeys = {
  questions: ["this-or-that", "questions"] as const,
  answers: (userId: string) => ["this-or-that", "answers", userId] as const,
};
