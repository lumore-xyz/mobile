import { createContext, useCallback, useContext, useEffect, useState } from "react";
import socketIoClient from "socket.io-client";
import config from "../config";
import { socketError, socketWarn } from "../socket-debug";
import {
  ACCESS_TOKEN_KEY,
  USER_KEY,
  getAccessToken,
  getUser,
  storage,
} from "../storage";

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
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const revalidateSocket = useCallback(() => {
    const _user = getUser();
    setUserId(_user?._id || null);
    setAuthToken(getAccessToken() || null);
  }, []);

  useEffect(() => {
    const listener = storage.addOnValueChangedListener((changedKey) => {
      if (changedKey === ACCESS_TOKEN_KEY) {
        setAuthToken(getAccessToken() || null);
      }

      if (changedKey === USER_KEY) {
        const nextUser = getUser();
        setUserId(nextUser?._id || null);
      }
    });

    return () => {
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (!userId || !authToken) {
      socketWarn(
        "SocketContext",
        "missing userId or access token; closing any existing socket",
      );
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
    const applyLatestToken = () => {
      const nextToken = getAccessToken();
      if (!nextToken) return;
      newSocket.auth = { token: nextToken };
    };
    const handleReconnectAttempt = () => {
      applyLatestToken();
    };

    const newSocket = socketIoClient(config.SOCKET_URL, {
      auth: { token: authToken },
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
      applyLatestToken();
      setIsConnected(false);
      setIsActive(false);
    });

    newSocket.io.on("reconnect_attempt", handleReconnectAttempt);

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
        applyLatestToken();
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
      newSocket.io.off("reconnect_attempt", handleReconnectAttempt);
      newSocket.close();
    };
  }, [authToken, userId]);

  return (
    <SocketContext.Provider
      value={{ socket, isConnected, isActive, revalidateSocket }}
    >
      {children}
    </SocketContext.Provider>
  );
};
