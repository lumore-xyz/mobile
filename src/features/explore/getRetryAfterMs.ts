export default function getRetryAfterMs(value: unknown, now = Date.now()) {
  if (value === undefined || value === null || value === "") return 3000;
  const seconds = Number(value);
  const delay = Number.isFinite(seconds)
    ? seconds * 1000
    : Date.parse(String(value)) - now;
  return Number.isFinite(delay) ? Math.max(1000, delay) : 3000;
}
