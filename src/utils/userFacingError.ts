const TECHNICAL_MESSAGE_PATTERNS = [
  /\bconfiguration\b/i,
  /\bconfig\b/i,
  /\bclient id\b/i,
  /\bid token\b/i,
  /\btoken\b/i,
  /\bnative module\b/i,
  /\bexpo[-\s]?audio\b/i,
  /\bfirebase\b/i,
  /\boauth\b/i,
  /\bapi\b/i,
  /\bserver error\b/i,
  /\bnetwork error\b/i,
  /\brequest failed\b/i,
  /\bstatus code\b/i,
  /\bundefined\b/i,
  /\bnull\b/i,
  /\bstack\b/i,
  /\bexception\b/i,
  /\bmongoose\b/i,
  /\bobjectid\b/i,
  /\bcast\b/i,
  /\bunauthorized\b/i,
  /\bforbidden\b/i,
];

const hasTechnicalLanguage = (message: string) =>
  TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(message));

const getRawErrorMessage = (error: unknown) => {
  const responseMessage = (error as any)?.response?.data?.message;
  if (typeof responseMessage === "string") return responseMessage;
  if (error instanceof Error) return error.message;
  return "";
};

export const toUserFacingError = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) => {
  const message = getRawErrorMessage(error).trim();
  if (!message || hasTechnicalLanguage(message)) return fallback;
  return message;
};
