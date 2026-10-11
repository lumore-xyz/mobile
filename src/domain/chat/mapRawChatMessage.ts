import getChatSenderId from "@/src/domain/chat/getChatSenderId";
import mapRawChatReplyPreview from "@/src/domain/chat/mapRawChatReplyPreview";
import normalizeAudioMetadata from "@/src/domain/chat/normalizeAudioMetadata";
import toChatTimestamp from "@/src/domain/chat/toChatTimestamp";
import type { Message, RawChatMessage } from "@/src/domain/chat/types";

const mapRawChatMessage = (rawMessage: RawChatMessage): Message => {
  const messageType = rawMessage?.messageType || "text";
  return {
    _id: rawMessage?._id,
    clientMessageId: rawMessage?.clientMessageId || undefined,
    sender: getChatSenderId(rawMessage?.sender, rawMessage?.senderId),
    message: messageType === "text" ? rawMessage?.message || "" : "",
    messageType,
    imageUrl: rawMessage?.imageUrl || null,
    imagePublicId: rawMessage?.imagePublicId || null,
    audioUrl: rawMessage?.audioUrl || null,
    audioPublicId: rawMessage?.audioPublicId || null,
    ...normalizeAudioMetadata(
      rawMessage?.audioDurationMs,
      rawMessage?.audioWaveform,
    ),
    timestamp:
      toChatTimestamp(rawMessage.timestamp) ??
      toChatTimestamp(rawMessage.createdAt) ??
      Date.now(),
    replyTo: mapRawChatReplyPreview(rawMessage?.replyTo),
    reactions: (rawMessage?.reactions || []).map((reaction) => ({
      userId: getChatSenderId(reaction.userId || reaction.user),
      emoji: reaction.emoji || "\u2764\uFE0F",
    })),
    editedAt: toChatTimestamp(rawMessage?.editedAt),
    deliveredAt: toChatTimestamp(rawMessage?.deliveredAt),
    readAt: toChatTimestamp(rawMessage?.readAt),
    pending: false,
  };
};

export default mapRawChatMessage;
