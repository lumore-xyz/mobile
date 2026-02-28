import { EXPLORE_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import type {
  CreditsEventPayload,
  MatchFoundPayload,
  MatchmakingErrorPayload,
  ProfileLockPayload,
} from "@/src/domain/chat/types";
import { useConfetti } from "@/src/hooks/useConfetti";
import { useUser } from "@/src/hooks/useUser";
import { useRouter } from "expo-router";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { trackAnalytic } from "../analytics";
import { queryClient } from "../query-client";
import { socketDebug, socketError, socketWarn } from "../socket-debug";
import { getUser } from "../storage";
import { useSocket } from "./SocketContext";

interface ExploreChatContextType {
  matchId: string | null;
  isMatching: boolean;
  error: string | null;
  startMatchmaking: () => void;
  stopMatchmaking: () => void;
  revalidateUser: () => void;
}

const ExploreChatContext = createContext<ExploreChatContextType | undefined>(
  undefined,
);

export const ExploreChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userId, setUserId] = useState<string | null>(null);
  const { user } = useUser(userId as string);
  const [isMatching, setIsMatching] = useState(user?.isMatching || false);
  const { socket, revalidateSocket } = useSocket();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { fireSideCannons } = useConfetti();

  useEffect(() => {
    if (user) {
      socketDebug("ExploreChatContext", "sync user.isMatching to local state", {
        userId: user?._id,
        isMatching: Boolean(user?.isMatching),
      });
      setIsMatching(user.isMatching || false);
    }
  }, [user]);

  const revalidateUser = () => {
    socketDebug("ExploreChatContext", "revalidateUser called", {
      hasExistingUserId: Boolean(userId),
    });
    if (userId) {
      socketDebug("ExploreChatContext", "revalidateUser skipped: userId already set", {
        userId,
      });
      return;
    }
    const nextUser = getUser();
    socketDebug("ExploreChatContext", "resolved user from storage", {
      userId: nextUser?._id || null,
    });
    revalidateSocket();
    setUserId(nextUser?._id || null);
  };

  const startMatchmaking = () => {
    socketDebug("ExploreChatContext", "startMatchmaking called", {
      hasSocket: Boolean(socket),
      socketConnected: Boolean(socket?.connected),
      hasUser: Boolean(user),
      isMatching,
    });
    if (!socket) {
      socketWarn("ExploreChatContext", "startMatchmaking blocked: missing socket");
      return;
    }
    if (!user) {
      socketWarn("ExploreChatContext", "startMatchmaking blocked: missing user");
      return;
    }
    if (isMatching) {
      socketWarn("ExploreChatContext", "startMatchmaking blocked: already matching");
      return;
    }

    setIsMatching(true);
    setError(null);
    trackAnalytic({
      activity: "started_matchmaking",
      label: "Started Matchmaking",
    });

    socketDebug("ExploreChatContext", "emit startMatchmaking", {
      socketId: socket.id,
      userId: user?._id,
    });
    socket.emit("startMatchmaking");
  };

  const stopMatchmaking = () => {
    socketDebug("ExploreChatContext", "stopMatchmaking called", {
      hasSocket: Boolean(socket),
      socketConnected: Boolean(socket?.connected),
      userId,
      isMatching,
    });
    if (!socket) {
      socketWarn("ExploreChatContext", "stopMatchmaking blocked: missing socket");
      return;
    }
    if (!userId) {
      socketWarn("ExploreChatContext", "stopMatchmaking blocked: missing userId");
      return;
    }
    if (!isMatching) {
      socketWarn("ExploreChatContext", "stopMatchmaking blocked: not matching");
      return;
    }

    setIsMatching(false);
    trackAnalytic({
      activity: "stoped_matchmaking",
      label: "Stoped Matchmaking",
    });
    socketDebug("ExploreChatContext", "emit stopMatchmaking", {
      userId,
      socketId: socket.id,
    });
    socket.emit("stopMatchmaking", { userId });
  };

  const onMatchFound = useCallback((roomId: string, matchedUser: unknown) => {
    socketDebug("ExploreChatContext", "matchFound received", {
      roomId,
      matchedUser,
    });
    setMatchId(roomId);
    setIsMatching(false);
    fireSideCannons();
    trackAnalytic({
      activity: "match_found",
      label: "Match Found",
    });
    queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
    queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
    router.push(`/chat/${roomId}`);
  }, [fireSideCannons, router]);

  useEffect(() => {
    if (!socket) {
      socketWarn("ExploreChatContext", "event subscription skipped: socket missing");
      return;
    }

    socketDebug("ExploreChatContext", "attaching explore socket listeners", {
      socketId: socket.id,
    });

    socket.on(
      EXPLORE_SOCKET_EVENTS.matchFound,
      ({ roomId, matchedUser }: MatchFoundPayload) => {
        socketDebug("ExploreChatContext", "event matchFound", {
          roomId,
          matchedUserId: (matchedUser as any)?._id || null,
        });
        onMatchFound(roomId, matchedUser);
      },
    );

    socket.on(
      EXPLORE_SOCKET_EVENTS.matchmakingError,
      ({ message }: MatchmakingErrorPayload) => {
        socketError("ExploreChatContext", "event matchmakingError", {
          message,
        });
        setError(message || "Unable to continue matchmaking right now.");
        setIsMatching(false);
      },
    );

    socket.on(
      EXPLORE_SOCKET_EVENTS.insufficientCredits,
      ({ message }: CreditsEventPayload) => {
        socketWarn("ExploreChatContext", "event insufficientCredits", {
          message,
        });
        setError(message || "Not enough credits to start matchmaking.");
        setIsMatching(false);
        queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
        queryClient.invalidateQueries({ queryKey: ["credits", "history"] });
      },
    );

    socket.on(EXPLORE_SOCKET_EVENTS.creditsUpdated, () => {
      socketDebug("ExploreChatContext", "event creditsUpdated");
      queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["credits", "history"] });
    });

    socket.on(
      EXPLORE_SOCKET_EVENTS.profileLocked,
      ({ lockedBy }: ProfileLockPayload) => {
        socketDebug("ExploreChatContext", "event profileLocked", {
          lockedBy,
        });
        queryClient.invalidateQueries({
          queryKey: ["user", lockedBy],
        });
      },
    );

    socket.on(
      EXPLORE_SOCKET_EVENTS.profileUnlocked,
      ({ unlockedBy }: ProfileLockPayload) => {
        socketDebug("ExploreChatContext", "event profileUnlocked", {
          unlockedBy,
        });
        queryClient.invalidateQueries({
          queryKey: ["user", unlockedBy],
        });
      },
    );

    socket.on(EXPLORE_SOCKET_EVENTS.chatEnded, () => {
      socketDebug("ExploreChatContext", "event chatEnded");
      queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
    });

    return () => {
      socketDebug("ExploreChatContext", "detaching explore socket listeners", {
        socketId: socket.id,
      });
      socket.off(EXPLORE_SOCKET_EVENTS.matchFound);
      socket.off(EXPLORE_SOCKET_EVENTS.profileLocked);
      socket.off(EXPLORE_SOCKET_EVENTS.profileUnlocked);
      socket.off(EXPLORE_SOCKET_EVENTS.matchmakingError);
      socket.off(EXPLORE_SOCKET_EVENTS.insufficientCredits);
      socket.off(EXPLORE_SOCKET_EVENTS.creditsUpdated);
      socket.off(EXPLORE_SOCKET_EVENTS.chatEnded);
    };
  }, [socket, matchId, onMatchFound]);

  return (
    <ExploreChatContext.Provider
      value={{
        matchId,
        isMatching,
        error,
        startMatchmaking,
        stopMatchmaking,
        revalidateUser,
      }}
    >
      {children}
    </ExploreChatContext.Provider>
  );
};

export const useExploreChat = () => {
  const context = useContext(ExploreChatContext);
  if (context === undefined) {
    throw new Error(
      "useExploreChat must be used within an ExploreChatProvider",
    );
  }
  return context;
};
