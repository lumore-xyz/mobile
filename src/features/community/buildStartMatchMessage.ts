import type { StartLocationRoomMatchResult } from "./types";

export default function buildStartMatchMessage(
  result: StartLocationRoomMatchResult,
): string {
  if (result.matchCount > 0) {
    return `Started now and created ${result.matchCount} match${result.matchCount === 1 ? "" : "es"} for ${result.matchedUserCount} member${result.matchedUserCount === 1 ? "" : "s"}.`;
  }
  if (result.skippedUserCount > 0) {
    return `The cycle ran, but no matches were created this time. ${result.skippedUserCount} member${result.skippedUserCount === 1 ? "" : "s"} still need a compatible match or enough credits.`;
  }
  return "The cycle ran, but no matches were created this time.";
}
