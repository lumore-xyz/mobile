"use client";

import type {
  ChatRoom,
  Message,
} from "@/src/domain/chat/types";
import isChatRoomActive from "@/src/domain/chat/isChatRoomActive";
import useChatMessages from "@/src/hooks/chat/useChatMessages";
import invalidateInboxLists from "@/src/features/chat/invalidateInboxLists";
import { fetchRoomData } from "@/src/features/chat/api";
import { useUser } from "@/src/hooks/useUser";
import { useGlobalSearchParams, usePathname, useRouter } from "expo-router";
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
import { socketDebug, socketWarn } from "../socket-debug";
import { getUser } from "../storage";
import { useSocket } from "./SocketContext";

interface ChatContextType {
  roomId: string | null;
  roomData: ChatRoom | undefined;
  matchedUser: ReturnType<typeof useUser>["user"];
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  cancelChat: () => void;
  lockProfile: (profileId: string) => void;
  unlockProfile: (profileId: string) => void;
  revalidateUser: () => void;
  isLoading: boolean;
  isActive: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ roomId: string }>();
  const isChatThreadRoute = /^\/chat\/[^/]+$/.test(pathname || "");
  const roomId = isChatThreadRoute ? params?.roomId ?? null : null;
  const queryClient = useQueryClient();
  const { socket, revalidateSocket } = useSocket();
  const [isActive, setIsActive] = useState<boolean>(false);
  const { messages, setMessages } = useChatMessages(roomId, socket, setIsActive);
  const [userId, setUserId] = useState<string | null>(null);
  const [matchedUserId, setMatchedUserId] = useState<string | null>(null);
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

  useEffect(() => {
    if (roomId) return;
    setMatchedUserId(null);
    setIsActive(false);
  }, [roomId]);

  useEffect(() => {
    if (!roomData || !user?._id) return;
    const other = roomData.participants.find((p) => p._id !== user._id);
    const nextIsActive = isChatRoomActive(roomData);
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
  }, [roomData, roomId, user]);

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
    invalidateInboxLists(queryClient);
    setIsActive(false);
    router.push("/chat");
  }, [socket, roomId, queryClient, router]);

  const updateProfileLock = useCallback(
    (
      event: "lockProfile" | "unlockProfile",
      activity: "lock_profile" | "unlock_profile",
      label: string,
      profileId: string,
    ) => {
      if (!socket || !roomId || !userId) {
        socketWarn("ChatContext", `${event} blocked`, {
          hasSocket: Boolean(socket),
          roomId: roomId ?? null,
          userId: userId ?? null,
          profileId,
        });
        return;
      }
      socketDebug("ChatContext", `emit ${event}`, {
        roomId,
        userId,
        profileId,
        socketId: socket.id,
      });
      trackAnalytic({ activity, label, value: roomId });
      socket.emit(event, { roomId, userId, profileId });
    },
    [socket, roomId, userId],
  );

  const lockProfile = useCallback(
    (profileId: string) =>
      updateProfileLock("lockProfile", "lock_profile", "Lock Profile", profileId),
    [updateProfileLock],
  );
  const unlockProfile = useCallback(
    (profileId: string) =>
      updateProfileLock("unlockProfile", "unlock_profile", "Unlock Profile", profileId),
    [updateProfileLock],
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
      isLoading,
      isActive,
    }),
    [
      roomId,
      roomData,
      matchedUser,
      messages,
      setMessages,
      cancelChat,
      lockProfile,
      unlockProfile,
      revalidateUser,
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
