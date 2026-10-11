import type { Message } from "@/src/domain/chat/types";
import mapRawChatMessage from "@/src/domain/chat/mapRawChatMessage";
import invalidateInboxLists from "@/src/features/chat/invalidateInboxLists";
import { fetchRoomChat } from "@/src/features/chat/api";
import useChatSocketListeners from "@/src/hooks/chat/useChatSocketListeners";
import type { useSocket } from "@/src/service/context/SocketContext";
import { socketDebug, socketError } from "@/src/service/socket-debug";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

type ChatSocket = ReturnType<typeof useSocket>["socket"];

export default function useChatMessages(
  roomId: string | null,
  socket: ChatSocket,
  setIsActive: Dispatch<SetStateAction<boolean>>,
) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);

  const invalidateInboxQueries = useCallback(() => {
    invalidateInboxLists(queryClient);
  }, [queryClient]);

  useEffect(() => {
    if (!roomId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      socketDebug("ChatContext", "loadMessages started", { roomId });
      try {
        const raw = await fetchRoomChat(roomId);
        const mapped = raw.map(mapRawChatMessage);

        setMessages(mapped);
        socketDebug("ChatContext", "loadMessages success", {
          roomId,
          count: mapped.length,
        });
        invalidateInboxQueries();
      } catch (error) {
        socketError("ChatContext", "loadMessages failed", {
          roomId,
          error,
        });
        console.error("[Chat] Failed loading messages", error);
      }
    };

    void loadMessages();
  }, [invalidateInboxQueries, roomId]);

  useChatSocketListeners(
    socket,
    roomId,
    mapRawChatMessage,
    setMessages,
    invalidateInboxQueries,
    setIsActive,
  );

  return { messages, setMessages };
}
