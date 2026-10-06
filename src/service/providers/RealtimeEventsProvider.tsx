import { EXPLORE_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import type {
  MatchFoundPayload,
  ProfileLockPayload,
  RoomMatchFoundPayload,
} from "@/src/domain/chat/types";
import { useConfetti } from "@/src/hooks/useConfetti";
import { useRouter } from "expo-router";
import { useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { trackAnalytic } from "../analytics";
import { queryClient } from "../query-client";
import { socketDebug, socketWarn } from "../socket-debug";
import { useSocket } from "../context/SocketContext";

export const RealtimeEventsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { socket } = useSocket();
  const router = useRouter();
  const { fireSideCannons } = useConfetti();

  const onMatchFound = useCallback(
    ({ roomId, matchedUser }: MatchFoundPayload) => {
      socketDebug("RealtimeEventsProvider", "matchFound received", {
        roomId,
        matchedUser,
      });
      fireSideCannons();
      trackAnalytic({ activity: "match_found", label: "Match Found" });
      queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
      router.push(`/chat/${roomId}`);
    },
    [fireSideCannons, router],
  );

  const onRoomMatchFound = useCallback(
    ({ roomId, matchedUserId, locationRoom }: RoomMatchFoundPayload) => {
      socketDebug("RealtimeEventsProvider", "roomMatchFound received", {
        roomId,
        matchedUserId,
        locationRoomId: locationRoom?._id || null,
      });
      fireSideCannons();
      trackAnalytic({
        activity: "room_match_found",
        label: "Community Match Found",
      });
      queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      router.push(`/chat/${roomId}`);
    },
    [fireSideCannons, router],
  );

  useEffect(() => {
    if (!socket) {
      socketWarn(
        "RealtimeEventsProvider",
        "event subscription skipped: socket missing",
      );
      return;
    }

    const onRoomPoolUpdated = () => {
      socketDebug("RealtimeEventsProvider", "event roomPoolUpdated");
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    };
    const onCreditsUpdated = () => {
      socketDebug("RealtimeEventsProvider", "event creditsUpdated");
      queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["credits", "history"] });
    };
    const onProfileLocked = ({ lockedBy }: ProfileLockPayload) => {
      socketDebug("RealtimeEventsProvider", "event profileLocked", {
        lockedBy,
      });
      queryClient.invalidateQueries({ queryKey: ["user", lockedBy] });
    };
    const onProfileUnlocked = ({ unlockedBy }: ProfileLockPayload) => {
      socketDebug("RealtimeEventsProvider", "event profileUnlocked", {
        unlockedBy,
      });
      queryClient.invalidateQueries({ queryKey: ["user", unlockedBy] });
    };
    const onChatEnded = () => {
      socketDebug("RealtimeEventsProvider", "event chatEnded");
      queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
    };

    socketDebug("RealtimeEventsProvider", "attaching socket listeners");
    socket.on(EXPLORE_SOCKET_EVENTS.matchFound, onMatchFound);
    socket.on(EXPLORE_SOCKET_EVENTS.roomMatchFound, onRoomMatchFound);
    socket.on(EXPLORE_SOCKET_EVENTS.roomPoolUpdated, onRoomPoolUpdated);
    socket.on(EXPLORE_SOCKET_EVENTS.creditsUpdated, onCreditsUpdated);
    socket.on(EXPLORE_SOCKET_EVENTS.profileLocked, onProfileLocked);
    socket.on(EXPLORE_SOCKET_EVENTS.profileUnlocked, onProfileUnlocked);
    socket.on(EXPLORE_SOCKET_EVENTS.chatEnded, onChatEnded);

    return () => {
      socketDebug("RealtimeEventsProvider", "detaching socket listeners");
      socket.off(EXPLORE_SOCKET_EVENTS.matchFound, onMatchFound);
      socket.off(EXPLORE_SOCKET_EVENTS.roomMatchFound, onRoomMatchFound);
      socket.off(EXPLORE_SOCKET_EVENTS.roomPoolUpdated, onRoomPoolUpdated);
      socket.off(EXPLORE_SOCKET_EVENTS.creditsUpdated, onCreditsUpdated);
      socket.off(EXPLORE_SOCKET_EVENTS.profileLocked, onProfileLocked);
      socket.off(EXPLORE_SOCKET_EVENTS.profileUnlocked, onProfileUnlocked);
      socket.off(EXPLORE_SOCKET_EVENTS.chatEnded, onChatEnded);
    };
  }, [socket, onMatchFound, onRoomMatchFound]);

  return <>{children}</>;
};
