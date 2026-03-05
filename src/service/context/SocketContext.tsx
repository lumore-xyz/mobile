import { createContext, useCallback, useContext, useEffect, useState } from "react";
import socketIoClient from "socket.io-client";
import config from "../config";
import { socketError, socketWarn } from "../socket-debug";
import { getAccessToken, getUser } from "../storage";

type Socket = ReturnType<typeof socketIoClient>;

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isActive: boolean;
  revalidateSocket: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isActive: false,
  revalidateSocket: () => {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const revalidateSocket = useCallback(() => {
    if (userId) {
      return;
    }
    const _user = getUser();
    setUserId(_user?._id || null);
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      socketWarn("SocketContext", "no userId; closing any existing socket");
      setSocket((existingSocket) => {
        if (existingSocket) {
          existingSocket.close();
        }
        return null;
      });
      setIsConnected(false);
      setIsActive(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      socketWarn("SocketContext", "no access token; closing any existing socket", {
        userId,
      });
      setSocket((existingSocket) => {
        if (existingSocket) {
          existingSocket.close();
        }
        return null;
      });
      setIsConnected(false);
      setIsActive(false);
      return;
    }

    const newSocket = socketIoClient(config.SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      setIsActive(true);
    });

    newSocket.on("connect_error", (error: Error) => {
      socketError("SocketContext", "socket connect_error", {
        name: error?.name,
        message: error?.message,
      });
      setIsConnected(false);
      setIsActive(false);
    });

    newSocket.on("reconnect", () => {
      setIsConnected(true);
      setIsActive(true);
    });

    newSocket.on("reconnect_error", (error: Error) => {
      socketError("SocketContext", "socket reconnect_error", {
        name: error?.name,
        message: error?.message,
      });
    });

    newSocket.on("reconnect_failed", () => {
      socketError("SocketContext", "socket reconnect_failed");
      setIsConnected(false);
      setIsActive(false);
    });

    newSocket.on("disconnect", (reason: string) => {
      socketWarn("SocketContext", "socket disconnected", {
        reason,
        socketId: newSocket.id,
      });
      setIsConnected(false);
      setIsActive(false);

      if (reason === "io server disconnect") {
        newSocket.connect();
      }
    });

    setSocket(newSocket);

    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("ping");
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      newSocket.close();
    };
  }, [userId]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, isActive, revalidateSocket }}
    >
      {children}
    </SocketContext.Provider>
  );
};
