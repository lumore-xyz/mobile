import type { MatchRoomSummary } from "@/src/domain/chat/inboxTypes";

export default function getLastMessageIcon (room: MatchRoomSummary) {
  const type =
    room?.lastMessage?.previewType || room?.lastMessage?.messageType || "text";
  if (type === "image") return "Image";
  if (type === "audio") return "Mic";
  return "MessageCircle";
}
