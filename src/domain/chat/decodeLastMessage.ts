import type { MatchRoomSummary } from "@/src/domain/chat/inboxTypes";
import getChatMessageTypeLabel from "@/src/domain/chat/getChatMessageTypeLabel";

export default function decodeLastMessage (room: MatchRoomSummary) {
  const lastMessage = room?.lastMessage;
  if (!lastMessage) return "";

  const attachmentLabel = getChatMessageTypeLabel(
    lastMessage.previewType,
    lastMessage.messageType,
  );
  if (attachmentLabel) return attachmentLabel;

  if (!lastMessage.message) return "New message";
  return lastMessage.message;
}
