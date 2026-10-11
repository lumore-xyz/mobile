export default function formatAudioDuration(
  durationMs: number,
  fallbackSeconds = 0,
) {
  const totalSeconds = Math.max(
    0,
    Math.floor(durationMs > 0 ? durationMs / 1000 : fallbackSeconds),
  );
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
