import MobileNav from "@/src/components/MobileNav";
import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";

import { useUser } from "@/src/hooks/useUser";
import { fetchIbox } from "@/src/libs/apis";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { Inbox, InboxTabs } from ".";

const ChatInbox = () => {
  const u = getUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { socket, revalidateSocket } = useSocket();
  const { user, isLoading: gettingUser } = useUser(u?._id);

  const {
    data: rooms = [],
    isLoading,
    error,
    isRefetching,
    refetch,
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
      <View className="flex-1 bg-ui-surface-page px-4 pt-5">
        <View className="mb-5 rounded-[28px] bg-ui-foreground p-5">
          <Text className="text-3xl font-bold tracking-tight text-ui-light" accessibilityRole="header">
            Conversations
          </Text>
          <Text className="mt-1 text-sm leading-5 text-ui-light/70">
            Revisit connections whenever the moment feels right.
          </Text>
        </View>

        <InboxTabs
          activeTab="archive"
          archiveCount={rooms.length}
          onTabChange={(tab) => {
            if (tab === "active") router.replace("/chat");
          }}
        />

        <Inbox
          key="archive"
          user={user}
          rooms={rooms}
          isLoading={isLoading || gettingUser}
          error={error}
          mode="archive"
          isRefreshing={isRefetching}
          onRefresh={() => void refetch()}
        />
      </View>
      <MobileNav />
    </>
  );
};

export default ChatInbox;
