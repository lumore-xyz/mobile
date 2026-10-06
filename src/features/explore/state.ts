export const getRetryAfterMs = (value: unknown, now = Date.now()) => {
  if (value === undefined || value === null || value === '') return 3000;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(String(value)) - now;
  return Number.isFinite(delay) ? Math.max(1000, delay) : 3000;
};

export const isExploreExpired = (resetAt?: string, now = Date.now()) =>
  Boolean(resetAt && Number.isFinite(Date.parse(resetAt)) && Date.parse(resetAt) <= now);

export const getExploreErrorAction = (error: unknown) => {
  const response = (error as { response?: { status?: number; data?: { code?: string } } })?.response;
  if (response?.status === 401) return 'login';
  if (response?.data?.code === 'INSUFFICIENT_CREDITS') return 'credits';
  if (response?.data?.code === 'INCOMPLETE_PROFILE') return 'profile';
  if (response?.data?.code === 'INVALID_AGE_PREFERENCE') return 'preferences';
  return 'retry';
};
