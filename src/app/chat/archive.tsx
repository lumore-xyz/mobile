import MobileNav from "@/src/components/MobileNav";
import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";

import { useUser } from "@/src/hooks/useUser";
import { fetchIbox } from "@/src/libs/apis";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { Inbox, InboxTabs } from ".";

const ChatInbox = () => {
  const u = getUser();
  const queryClient = useQueryClient();
  const { socket, revalidateSocket } = useSocket();
  const { user, isLoading: gettingUser } = useUser(u?._id);

  const {
    data: rooms = [],
    isLoading,
    error,
  } = useQuery<any[]>({
    queryKey: ["inbox", "archive"],
    queryFn: () => fetchIbox("archive"),
    enabled: !!u,
  });

  useEffect(() => {
    revalidateSocket();
  }, [revalidateSocket]);

  useEffect(() => {
    if (!socket) return;

    const onInboxUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
    };

    socket.on(CHAT_SOCKET_EVENTS.inboxUpdated, onInboxUpdated);
    return () => {
      socket.off(CHAT_SOCKET_EVENTS.inboxUpdated, onInboxUpdated);
    };
  }, [socket, queryClient]);

  return (
    <>
      <View className="flex-1 pt-6 px-4">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold tracking-tight">Inbox</Text>
        </View>

        <InboxTabs activeTab="archive" />

        <Inbox
          key="archive"
          user={user}
          rooms={rooms}
          isLoading={isLoading || gettingUser}
          error={error}
        />
      </View>
      <MobileNav />
    </>
  );
};

export default ChatInbox;
