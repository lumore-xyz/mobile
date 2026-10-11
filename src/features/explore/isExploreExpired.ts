export default function isExploreExpired(resetAt?: string, now = Date.now()) {
  return Boolean(
    resetAt && Number.isFinite(Date.parse(resetAt)) && Date.parse(resetAt) <= now,
  );
}
