import { createContext, useCallback, useContext, useEffect, useState } from "react";
import socketIoClient from "socket.io-client";
import { SOCKET_NAMESPACE, SOCKET_URL } from "../config";
import { socketDebug, socketError, socketWarn } from "../socket-debug";
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
    socketDebug("SocketContext", "revalidateSocket called", {
      hasExistingUserId: Boolean(userId),
    });
    if (userId) {
      socketDebug("SocketContext", "revalidateSocket skipped: userId already set", {
        userId,
      });
      return;
    }
    const _user = getUser();
    socketDebug("SocketContext", "resolved user from storage", {
      userId: _user?._id || null,
    });
    setUserId(_user?._id || null);
  }, [userId]);

  useEffect(() => {
    socketDebug("SocketContext", "socket effect triggered", {
      userId,
    });

    if (!userId) {
      socketWarn("SocketContext", "no userId; closing any existing socket");
      setSocket((existingSocket) => {
        if (existingSocket) {
          socketDebug("SocketContext", "closing existing socket due to missing userId", {
            socketId: existingSocket.id,
          });
          existingSocket.close();
        }
        return null;
      });
      setIsConnected(false);
      setIsActive(false);
      return;
    }

    const token = getAccessToken();
    socketDebug("SocketContext", "resolved access token", {
      hasToken: Boolean(token),
    });
    if (!token) {
      socketWarn("SocketContext", "no access token; closing any existing socket", {
        userId,
      });
      setSocket((existingSocket) => {
        if (existingSocket) {
          socketDebug("SocketContext", "closing existing socket due to missing token", {
            socketId: existingSocket.id,
          });
          existingSocket.close();
        }
        return null;
      });
      setIsConnected(false);
      setIsActive(false);
      return;
    }

    socketDebug("SocketContext", "creating new socket", {
      endpoint: SOCKET_URL,
      namespace: SOCKET_NAMESPACE,
      userId,
      transports: ["websocket", "polling"],
    });
    const newSocket = socketIoClient(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      socketDebug("SocketContext", "socket connected", {
        socketId: newSocket.id,
      });
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

    newSocket.on("reconnect", (attemptNumber: number) => {
      socketDebug("SocketContext", "socket reconnected", {
        attemptNumber,
        socketId: newSocket.id,
      });
      setIsConnected(true);
      setIsActive(true);
    });

    newSocket.on("reconnect_attempt", (attemptNumber: number) => {
      socketDebug("SocketContext", "socket reconnect_attempt", {
        attemptNumber,
      });
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
        socketDebug("SocketContext", "manual reconnect after server disconnect");
        newSocket.connect();
      }
    });

    socketDebug("SocketContext", "socket stored in context state");
    setSocket(newSocket);

    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        socketDebug("SocketContext", "emit ping", {
          socketId: newSocket.id,
        });
        newSocket.emit("ping");
      }
    }, 30000);

    return () => {
      socketDebug("SocketContext", "cleanup socket effect", {
        socketId: newSocket.id,
      });
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
