import getChatSenderId from "@/src/domain/chat/getChatSenderId";
import getChatMessageTypeLabel from "@/src/domain/chat/getChatMessageTypeLabel";
import normalizeAudioMetadata from "@/src/domain/chat/normalizeAudioMetadata";
import type { ChatReplyPreview, RawChatMessage } from "@/src/domain/chat/types";

const mapRawChatReplyPreview = (
  replyTo: RawChatMessage | null | undefined,
): ChatReplyPreview | null => {
  if (!replyTo?._id) return null;

  const messageType = replyTo.messageType || "text";
  return {
    _id: replyTo._id,
    senderId: getChatSenderId(replyTo.sender, replyTo.senderId),
    messageType,
    message:
      getChatMessageTypeLabel(messageType) || replyTo.message || "Message",
    imageUrl: replyTo.imageUrl || null,
    audioUrl: replyTo.audioUrl || null,
    ...normalizeAudioMetadata(replyTo.audioDurationMs, replyTo.audioWaveform),
  };
};

export default mapRawChatReplyPreview;
