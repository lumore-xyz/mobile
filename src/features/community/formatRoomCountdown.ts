export type RoomCountdownPrecision = "minutes" | "seconds";

export default function formatRoomCountdown(
  seconds: number,
  precision: RoomCountdownPrecision,
) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;

  if (precision === "minutes") {
    if (hours <= 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) return `${hours}h ${minutes}m ${remainingSeconds}s`;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}
