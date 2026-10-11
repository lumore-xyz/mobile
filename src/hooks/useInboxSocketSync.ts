import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import invalidateInboxLists from "@/src/features/chat/invalidateInboxLists";
import { useSocket } from "@/src/service/context/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export default function useInboxSocketSync() {
  const queryClient = useQueryClient();
  const { socket, revalidateSocket } = useSocket();

  useEffect(() => {
    revalidateSocket();
  }, [revalidateSocket]);

  useEffect(() => {
    if (!socket) return;

    const refreshInbox = () => {
      invalidateInboxLists(queryClient);
    };

    socket.on(CHAT_SOCKET_EVENTS.inboxUpdated, refreshInbox);
    return () => {
      socket.off(CHAT_SOCKET_EVENTS.inboxUpdated, refreshInbox);
    };
  }, [queryClient, socket]);
}
