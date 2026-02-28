import MobileNav from "@/src/components/MobileNav";
import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";

import { useUser } from "@/src/hooks/useUser";
import { fetchIbox } from "@/src/libs/apis";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Inbox } from ".";

const ChatInbox = () => {
  const u = getUser();
  const router = useRouter();
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

        {/* Tabs */}
        <View className="flex-row bg-ui-shade/5 rounded-xl p-2 mb-5">
          <TouchableOpacity
            onPress={() => router.push("/chat/")}
            className={`flex-1 py-2 rounded-lg `}
          >
            <Text className={`text-center font-medium text-ui-shade`}>
              Active
            </Text>
          </TouchableOpacity>
          <View className={`flex-1 py-2 rounded-lg bg-ui-light shadow-sm`}>
            <Text className={`text-center font-medium text-ui-shade`}>
              Archived
            </Text>
          </View>
        </View>

        <Inbox
          key={"active"}
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
