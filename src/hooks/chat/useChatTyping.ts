import { socketDebug } from "@/src/service/socket-debug";
import type { useSocket } from "@/src/service/context/SocketContext";
import { useEffect, useRef, useState } from "react";

type ChatSocket = ReturnType<typeof useSocket>["socket"];

const useChatTyping = (
  socket: ChatSocket,
  roomId: string | null,
  partnerId: string | undefined,
  isActive: boolean,
  message: string,
) => {
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const partnerTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (!socket || !roomId || !partnerId || !isActive) return;

    const onTyping = (payload: {
      roomId?: string;
      userId?: string;
      isTyping?: boolean;
    }) => {
      if (payload?.roomId !== roomId || payload?.userId !== partnerId) return;

      const typing = Boolean(payload?.isTyping);
      socketDebug("ChatScreen", "event typing", {
        roomId,
        fromUserId: payload?.userId || null,
        isTyping: typing,
      });
      setIsPartnerTyping(typing);

      if (partnerTypingTimeoutRef.current) {
        clearTimeout(partnerTypingTimeoutRef.current);
      }
      if (typing) {
        partnerTypingTimeoutRef.current = setTimeout(() => {
          setIsPartnerTyping(false);
        }, 2500);
      }
    };

    socketDebug("ChatScreen", "attach typing listener", {
      roomId,
      matchedUserId: partnerId,
      socketId: socket.id,
    });
    socket.on("typing", onTyping);

    return () => {
      socketDebug("ChatScreen", "detach typing listener", {
        roomId,
        matchedUserId: partnerId,
        socketId: socket.id,
      });
      socket.off("typing", onTyping);
      if (partnerTypingTimeoutRef.current) {
        clearTimeout(partnerTypingTimeoutRef.current);
        partnerTypingTimeoutRef.current = null;
      }
    };
  }, [socket, roomId, partnerId, isActive]);

  useEffect(() => {
    if (!socket || !roomId || !isActive) return;
    const isTyping = message.trim().length > 0;
    socketDebug("ChatScreen", "emit typing", {
      roomId,
      isTyping,
      textLength: message.trim().length,
      socketId: socket.id,
    });
    socket.emit("typing", { roomId, isTyping });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        socketDebug("ChatScreen", "emit typing false from timeout", {
          roomId,
          socketId: socket.id,
        });
        socket.emit("typing", { roomId, isTyping: false });
      }, 1500);
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [message, socket, roomId, isActive]);

  useEffect(
    () => () => {
      if (socket && roomId) {
        socketDebug("ChatScreen", "emit typing false on unmount", {
          roomId,
          socketId: socket.id,
        });
        socket.emit("typing", { roomId, isTyping: false });
      }
    },
    [socket, roomId],
  );

  return isPartnerTyping;
};

export default useChatTyping;
