import getChatMessageTypeLabel from "@/src/domain/chat/getChatMessageTypeLabel";
import type { ChatReplyPreview, Message } from "@/src/domain/chat/types";

const toChatReplyPreview = (
  message: Message | null,
): ChatReplyPreview | null => {
  if (!message?._id) return null;

  const messageType = message.messageType || "text";
  return {
    _id: message._id,
    senderId: message.sender,
    messageType,
    message:
      getChatMessageTypeLabel(messageType) ||
      (message.message || "").slice(0, 140),
    imageUrl: message.imageUrl || null,
    audioUrl: message.audioUrl || null,
    audioDurationMs: message.audioDurationMs || null,
  };
};

export default toChatReplyPreview;
