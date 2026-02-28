"use client";

import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import type {
  ChatReplyPreview,
  Message,
  MessageDeliveredPayload,
  MessageReactionUpdatedPayload,
  MessageReadPayload,
} from "@/src/domain/chat/types";
import { fetchRoomChat, fetchRoomData } from "@/src/libs/apis";
import { useUser } from "@/src/hooks/useUser";
import { useGlobalSearchParams, useRouter } from "expo-router";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trackAnalytic } from "../analytics";
import { socketDebug, socketError, socketWarn } from "../socket-debug";
import { getUser } from "../storage";
import { useSocket } from "./SocketContext";

interface ChatContextType {
  roomId: string | null;
  roomData: any | null;
  matchedUser: any | null;
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  cancelChat: () => void;
  lockProfile: (profileId: string) => void;
  unlockProfile: (profileId: string) => void;
  revalidateUser: () => void;
  error: string | null;
  isLoading: boolean;
  isActive: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

const getSenderId = (sender: any): string => {
  if (!sender) return "";
  if (typeof sender === "string") return sender;
  return sender._id || sender.id || "";
};

const mapReplyPreview = (replyTo: any) => {
  if (!replyTo?._id) return null;

  const replyType: "text" | "image" = replyTo.messageType || "text";
  const replyMessage = replyType === "image" ? "Photo" : replyTo.message || "Message";

  return {
    _id: replyTo._id,
    senderId: getSenderId(replyTo.sender) || replyTo.senderId || "",
    messageType: replyType,
    message: replyMessage,
    imageUrl: replyTo.imageUrl || null,
  } as ChatReplyPreview;
};

const sortByTimestamp = (items: Message[]) =>
  [...items].sort((a, b) => a.timestamp - b.timestamp);

const deriveRoomIsActive = (room: any): boolean => {
  if (!room) return false;

  if (typeof room.isActive === "boolean") return room.isActive;
  if (room.endedAt || room.endedBy) return false;

  const rawStatus = String(room.status ?? "").toLowerCase().trim();
  if (!rawStatus) return true;
  if (["archive", "archived", "ended", "closed", "inactive"].includes(rawStatus)) {
    return false;
  }

  return true;
};

const mergeIncomingMessage = (messages: Message[], incoming: Message) => {
  const next = [...messages];

  if (incoming.clientMessageId) {
    const optimisticIndex = next.findIndex(
      (item) => item.clientMessageId === incoming.clientMessageId,
    );
    if (optimisticIndex >= 0) {
      next[optimisticIndex] = { ...next[optimisticIndex], ...incoming, pending: false };
      return sortByTimestamp(next);
    }
  }

  if (incoming._id) {
    const existingIndex = next.findIndex((item) => item._id === incoming._id);
    if (existingIndex >= 0) {
      next[existingIndex] = { ...next[existingIndex], ...incoming, pending: false };
      return sortByTimestamp(next);
    }
  }

  next.push(incoming);
  return sortByTimestamp(next);
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const params = useGlobalSearchParams<{ roomId: string }>();
  const roomId = params?.roomId ?? null;
  const queryClient = useQueryClient();
  const { socket, revalidateSocket } = useSocket();
  const [userId, setUserId] = useState<string | null>(null);
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const router = useRouter();
  const { user } = useUser(userId ?? "");
  const { user: matchedUser, isLoading } = useUser(matchedUserId ?? "");
  const { data: roomData } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => fetchRoomData(roomId!),
    enabled: !!roomId,
  });

  const revalidateUser = useCallback(() => {
    socketDebug("ChatContext", "revalidateUser called", {
      hasExistingUserId: Boolean(userId),
    });
    if (userId) {
      socketDebug("ChatContext", "revalidateUser skipped: userId already set", {
        userId,
      });
      return;
    }
    const u = getUser();
    if (!u?._id) {
      socketWarn("ChatContext", "revalidateUser: no stored userId");
      return;
    }
    socketDebug("ChatContext", "revalidateUser resolved stored userId", {
      userId: u._id,
    });
    revalidateSocket();
    setUserId(u._id);
  }, [userId, revalidateSocket]);

  useEffect(() => {
    revalidateUser();
  }, [revalidateUser]);

  const mapIncomingMessage = useCallback((rawMessage: any): Message | null => {
    const messageType: "text" | "image" = rawMessage?.messageType || "text";
    const text = messageType === "text" ? rawMessage?.message || "" : "";
    const sender = getSenderId(rawMessage?.sender) || rawMessage?.senderId || "";

    return {
      _id: rawMessage?._id,
      clientMessageId: rawMessage?.clientMessageId || undefined,
      sender,
      message: text,
      messageType,
      imageUrl: rawMessage?.imageUrl || null,
      imagePublicId: rawMessage?.imagePublicId || null,
      timestamp:
        rawMessage?.timestamp ||
        (rawMessage?.createdAt ? new Date(rawMessage.createdAt).getTime() : Date.now()),
      replyTo: mapReplyPreview(rawMessage?.replyTo),
      reactions: (rawMessage?.reactions || []).map((reaction: any) => ({
        userId: getSenderId(reaction.userId || reaction.user),
        emoji: reaction.emoji || "\u2764\uFE0F",
      })),
      editedAt: rawMessage?.editedAt ? new Date(rawMessage.editedAt).getTime() : null,
      deliveredAt: rawMessage?.deliveredAt ? new Date(rawMessage.deliveredAt).getTime() : null,
      readAt: rawMessage?.readAt ? new Date(rawMessage.readAt).getTime() : null,
      pending: false,
    };
  }, []);

  useEffect(() => {
    if (!roomData || !user?._id) return;
    const other = roomData.participants.find((p: any) => p._id !== user._id);
    const nextIsActive = deriveRoomIsActive(roomData);
    socketDebug("ChatContext", "roomData resolved", {
      roomId,
      currentUserId: user?._id,
      matchedUserId: other?._id ?? null,
      isActive: nextIsActive,
      status: roomData?.status ?? null,
      endedAt: roomData?.endedAt ?? null,
      endedBy: roomData?.endedBy ?? null,
    });
    setMatchedUserId(other?._id ?? null);
    setIsActive(nextIsActive);
  }, [roomData, user]);

  useEffect(() => {
    if (!roomId) return;

    const loadMessages = async () => {
      socketDebug("ChatContext", "loadMessages started", {
        roomId,
      });
      try {
        const raw = await fetchRoomChat(roomId);
        const mapped: Message[] = raw
          .map((msg: any) => mapIncomingMessage(msg))
          .filter(Boolean) as Message[];

        setMessages(mapped);
        socketDebug("ChatContext", "loadMessages success", {
          roomId,
          count: mapped.length,
        });
        queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
        queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
      } catch (e) {
        socketError("ChatContext", "loadMessages failed", {
          roomId,
          error: e,
        });
        console.error("[Chat] Failed loading messages", e);
      }
    };

    void loadMessages();
  }, [roomId, queryClient, mapIncomingMessage]);

  const invalidateInboxQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
    queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
  }, [queryClient]);

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

    const onIncomingMessage = (payload: any) => {
      socketDebug("ChatContext", "event incoming message", {
        roomId,
        messageId: payload?._id || null,
        clientMessageId: payload?.clientMessageId || null,
        messageType: payload?.messageType || "text",
        senderId: getSenderId(payload?.sender) || payload?.senderId || null,
      });
      const mapped = mapIncomingMessage(payload);
      if (!mapped) return;
      setMessages((prev) => mergeIncomingMessage(prev, mapped));
      invalidateInboxQueries();
    };

    const onEdited = (payload: any) => {
      if (!payload?.messageId) return;
      socketDebug("ChatContext", "event message edited", {
        roomId,
        messageId: payload?.messageId,
      });
      const nextMessage = payload.message || "";

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === payload.messageId
            ? {
                ...msg,
                message: nextMessage || msg.message,
                editedAt: payload.editedAt
                  ? new Date(payload.editedAt).getTime()
                  : Date.now(),
              }
            : msg,
        ),
      );
      invalidateInboxQueries();
    };

    const onReactionUpdated = (payload: MessageReactionUpdatedPayload) => {
      if (!payload?.messageId) return;
      socketDebug("ChatContext", "event reaction updated", {
        roomId,
        messageId: payload.messageId,
        reactionCount: payload?.reactions?.length || 0,
      });
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === payload.messageId
            ? {
                ...msg,
                reactions: (payload.reactions || []).map((reaction) => ({
                  userId: getSenderId(reaction.userId || reaction.user),
                  emoji: reaction.emoji || "\u2764\uFE0F",
                })),
              }
            : msg,
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

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id && messageIds.has(msg._id)
            ? {
                ...msg,
                deliveredAt: msg.deliveredAt || deliveredAt,
              }
            : msg,
        ),
      );
      invalidateInboxQueries();
    };

    const onRead = (payload: MessageReadPayload) => {
      const messageIds = new Set((payload?.messageIds || []).map(String));
      const readAt = payload?.readAt ? new Date(payload.readAt).getTime() : Date.now();
      if (messageIds.size === 0) return;
      socketDebug("ChatContext", "event message read", {
        roomId,
        messageCount: messageIds.size,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id && messageIds.has(msg._id)
            ? {
                ...msg,
                deliveredAt: msg.deliveredAt || readAt,
                readAt: msg.readAt || readAt,
              }
            : msg,
        ),
      );
      invalidateInboxQueries();
    };

    socket.on(CHAT_SOCKET_EVENTS.newMessage, onIncomingMessage);
    socket.on(CHAT_SOCKET_EVENTS.messageSent, onIncomingMessage);
    socket.on(CHAT_SOCKET_EVENTS.messageEdited, onEdited);
    socket.on(CHAT_SOCKET_EVENTS.messageReactionUpdated, onReactionUpdated);
    socket.on(CHAT_SOCKET_EVENTS.messageDelivered, onDelivered);
    socket.on(CHAT_SOCKET_EVENTS.messageRead, onRead);
    socket.on(CHAT_SOCKET_EVENTS.chatEnded, () => {
      socketWarn("ChatContext", "event chatEnded", {
        roomId,
      });
      setIsActive(false);
      invalidateInboxQueries();
    });

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
      socket.off(CHAT_SOCKET_EVENTS.chatEnded);
    };
  }, [
    socket,
    roomId,
    mapIncomingMessage,
    invalidateInboxQueries,
  ]);

  const cancelChat = useCallback(() => {
    if (!socket || !roomId) {
      socketWarn("ChatContext", "cancelChat blocked", {
        hasSocket: Boolean(socket),
        roomId: roomId ?? null,
      });
      return;
    }
    socketDebug("ChatContext", "emit endChat", {
      roomId,
      socketId: socket.id,
    });
    trackAnalytic({
      activity: "end_chat",
      label: "end Chat",
      value: roomId,
    });
    socket.emit("endChat", { roomId });
    queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
    queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
    setIsActive(false);
    router.push("/chat");
  }, [socket, roomId, queryClient, router]);

  const lockProfile = useCallback(
    (profileId: string) => {
      if (!socket || !roomId || !userId) {
        socketWarn("ChatContext", "lockProfile blocked", {
          hasSocket: Boolean(socket),
          roomId: roomId ?? null,
          userId: userId ?? null,
          profileId,
        });
        return;
      }
      socketDebug("ChatContext", "emit lockProfile", {
        roomId,
        userId,
        profileId,
        socketId: socket.id,
      });
      trackAnalytic({
        activity: "lock_profile",
        label: "Lock Profile",
        value: roomId,
      });
      socket.emit("lockProfile", { roomId, userId, profileId });
    },
    [socket, roomId, userId],
  );

  const unlockProfile = useCallback(
    (profileId: string) => {
      if (!socket || !roomId || !userId) {
        socketWarn("ChatContext", "unlockProfile blocked", {
          hasSocket: Boolean(socket),
          roomId: roomId ?? null,
          userId: userId ?? null,
          profileId,
        });
        return;
      }
      socketDebug("ChatContext", "emit unlockProfile", {
        roomId,
        userId,
        profileId,
        socketId: socket.id,
      });
      trackAnalytic({
        activity: "unlock_profile",
        label: "Unlock Profile",
        value: roomId,
      });
      socket.emit("unlockProfile", { roomId, userId, profileId });
    },
    [socket, roomId, userId],
  );

  const value = useMemo(
    () => ({
      roomId,
      roomData,
      matchedUser,
      messages,
      setMessages,
      cancelChat,
      lockProfile,
      unlockProfile,
      revalidateUser,
      error,
      isLoading,
      isActive,
    }),
    [
      roomId,
      roomData,
      matchedUser,
      messages,
      cancelChat,
      lockProfile,
      unlockProfile,
      revalidateUser,
      error,
      isLoading,
      isActive,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside ChatProvider");
  return ctx;
};
