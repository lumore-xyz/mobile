import { socketDebug, socketWarn } from "@/src/service/socket-debug";
import type { useSocket } from "@/src/service/context/SocketContext";
import { useEffect, useState } from "react";

type ChatSocket = ReturnType<typeof useSocket>["socket"];

const useChatRoomConnection = (
  socket: ChatSocket,
  roomId: string | null,
  revalidateSocket: () => void,
) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketDebug("ChatScreen", "revalidateSocket requested");
    revalidateSocket();
  }, [revalidateSocket]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const joinChatRoom = () => {
      socketDebug("ChatScreen", "emit joinChat", {
        roomId,
        socketId: socket.id,
        socketConnected: socket.connected,
      });
      socket.emit("joinChat", { roomId });
    };

    socketDebug("ChatScreen", "chat room binding effect start", {
      roomId,
      socketId: socket.id,
      socketConnected: socket.connected,
    });
    setIsConnected(socket.connected);
    joinChatRoom();

    const onConnect = () => {
      socketDebug("ChatScreen", "socket connect event", {
        roomId,
        socketId: socket.id,
      });
      setIsConnected(true);
      joinChatRoom();
    };

    const onDisconnect = () => {
      socketWarn("ChatScreen", "socket disconnect event", {
        roomId,
        socketId: socket.id,
      });
      setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socketDebug("ChatScreen", "chat room binding cleanup", {
        roomId,
        socketId: socket.id,
      });
      socket.emit("leaveChat", { roomId });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket, roomId]);

  return isConnected;
};

export default useChatRoomConnection;
