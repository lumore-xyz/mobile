import type {
  Message,
  MessageDeliveredPayload,
  MessageReactionUpdatedPayload,
  MessageReadPayload,
  MessageEditedPayload,
  RawChatMessage,
} from "@/src/domain/chat/types";
import getChatSenderId from "@/src/domain/chat/getChatSenderId";
import mergeChatMessage from "@/src/domain/chat/mergeChatMessage";
import toChatTimestamp from "@/src/domain/chat/toChatTimestamp";
import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import { socketDebug, socketWarn } from "@/src/service/socket-debug";
import type { useSocket } from "@/src/service/context/SocketContext";
import { Dispatch, SetStateAction, useEffect } from "react";

type ChatSocket = ReturnType<typeof useSocket>["socket"];
type MapChatMessage = (rawMessage: RawChatMessage) => Message;

const useChatSocketListeners = (
  socket: ChatSocket,
  roomId: string | null,
  mapIncomingMessage: MapChatMessage,
  setMessages: Dispatch<SetStateAction<Message[]>>,
  invalidateInboxQueries: () => void,
  setIsActive: Dispatch<SetStateAction<boolean>>,
) => {
  useEffect(() => {
    if (!socket || !roomId) {
      socketWarn("ChatContext", "listener attach skipped", {
        hasSocket: Boolean(socket),
        roomId: roomId ?? null,
      });
      return;
    }

    socketDebug("ChatContext", "attaching chat listeners", {
      roomId,
      socketId: socket.id,
      events: [
        CHAT_SOCKET_EVENTS.newMessage,
        CHAT_SOCKET_EVENTS.messageSent,
        CHAT_SOCKET_EVENTS.messageEdited,
        CHAT_SOCKET_EVENTS.messageReactionUpdated,
        CHAT_SOCKET_EVENTS.messageDelivered,
        CHAT_SOCKET_EVENTS.messageRead,
        CHAT_SOCKET_EVENTS.chatEnded,
      ],
    });

    const onIncomingMessage = (payload: RawChatMessage) => {
      socketDebug("ChatContext", "event incoming message", {
        roomId,
        messageId: payload?._id || null,
        clientMessageId: payload?.clientMessageId || null,
        messageType: payload?.messageType || "text",
        senderId: getChatSenderId(payload?.sender, payload?.senderId) || null,
      });
      const mapped = mapIncomingMessage(payload);
      if (!mapped) return;
      setMessages((previous) => mergeChatMessage(previous, mapped));
      invalidateInboxQueries();
    };

    const onEdited = (payload: MessageEditedPayload) => {
      if (!payload?.messageId) return;
      socketDebug("ChatContext", "event message edited", {
        roomId,
        messageId: payload.messageId,
      });
      const nextMessage = payload.message || "";

      setMessages((previous) =>
        previous.map((message) =>
          message._id === payload.messageId
            ? {
                ...message,
                message: nextMessage || message.message,
                editedAt: toChatTimestamp(payload.editedAt) ?? Date.now(),
              }
            : message,
        ),
      );
      invalidateInboxQueries();
    };

    const onReactionUpdated = (payload: MessageReactionUpdatedPayload) => {
      if (!payload?.messageId) return;
      socketDebug("ChatContext", "event reaction updated", {
        roomId,
        messageId: payload.messageId,
        reactionCount: payload.reactions?.length || 0,
      });
      setMessages((previous) =>
        previous.map((message) =>
          message._id === payload.messageId
            ? {
                ...message,
                reactions: (payload.reactions || []).map((reaction) => ({
                  userId: getChatSenderId(reaction.userId || reaction.user),
                  emoji: reaction.emoji || "\u2764\uFE0F",
                })),
              }
            : message,
        ),
      );
      invalidateInboxQueries();
    };

    const onDelivered = (payload: MessageDeliveredPayload) => {
      const messageIds = new Set((payload?.messageIds || []).map(String));
      const deliveredAt = payload?.deliveredAt
        ? new Date(payload.deliveredAt).getTime()
        : Date.now();
      if (messageIds.size === 0) return;
      socketDebug("ChatContext", "event message delivered", {
        roomId,
        messageCount: messageIds.size,
      });

      setMessages((previous) =>
        previous.map((message) =>
          message._id && messageIds.has(message._id)
            ? {
                ...message,
                deliveredAt: message.deliveredAt || deliveredAt,
              }
            : message,
        ),
      );
      invalidateInboxQueries();
    };

    const onRead = (payload: MessageReadPayload) => {
      const messageIds = new Set((payload?.messageIds || []).map(String));
      const readAt = payload?.readAt
        ? new Date(payload.readAt).getTime()
        : Date.now();
      if (messageIds.size === 0) return;
      socketDebug("ChatContext", "event message read", {
        roomId,
        messageCount: messageIds.size,
      });

      setMessages((previous) =>
        previous.map((message) =>
          message._id && messageIds.has(message._id)
            ? {
                ...message,
                deliveredAt: message.deliveredAt || readAt,
                readAt: message.readAt || readAt,
              }
            : message,
        ),
      );
      invalidateInboxQueries();
    };

    const onChatEnded = () => {
      socketWarn("ChatContext", "event chatEnded", { roomId });
      setIsActive(false);
      invalidateInboxQueries();
    };

    socket.on(CHAT_SOCKET_EVENTS.newMessage, onIncomingMessage);
    socket.on(CHAT_SOCKET_EVENTS.messageSent, onIncomingMessage);
    socket.on(CHAT_SOCKET_EVENTS.messageEdited, onEdited);
    socket.on(CHAT_SOCKET_EVENTS.messageReactionUpdated, onReactionUpdated);
    socket.on(CHAT_SOCKET_EVENTS.messageDelivered, onDelivered);
    socket.on(CHAT_SOCKET_EVENTS.messageRead, onRead);
    socket.on(CHAT_SOCKET_EVENTS.chatEnded, onChatEnded);

    return () => {
      socketDebug("ChatContext", "detaching chat listeners", {
        roomId,
        socketId: socket.id,
      });
      socket.off(CHAT_SOCKET_EVENTS.newMessage, onIncomingMessage);
      socket.off(CHAT_SOCKET_EVENTS.messageSent, onIncomingMessage);
      socket.off(CHAT_SOCKET_EVENTS.messageEdited, onEdited);
      socket.off(CHAT_SOCKET_EVENTS.messageReactionUpdated, onReactionUpdated);
      socket.off(CHAT_SOCKET_EVENTS.messageDelivered, onDelivered);
      socket.off(CHAT_SOCKET_EVENTS.messageRead, onRead);
      socket.off(CHAT_SOCKET_EVENTS.chatEnded, onChatEnded);
    };
  }, [
    socket,
    roomId,
    mapIncomingMessage,
    setMessages,
    invalidateInboxQueries,
    setIsActive,
  ]);
};

export default useChatSocketListeners;
