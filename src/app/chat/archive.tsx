import MobileNav from "@/src/components/MobileNav";
import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";

import { useUser } from "@/src/hooks/useUser";
import { fetchIboxPage } from "@/src/libs/apis";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { Inbox, InboxTabs, InboxFiltersState } from ".";

const ChatInbox = () => {
  const u = getUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [filters, setFilters] = React.useState<InboxFiltersState>({
    search: "",
    unreadOnly: false,
    sort: "recent",
  });
  const { socket, revalidateSocket } = useSocket();
  const { user, isLoading: gettingUser } = useUser(u?._id);

  const query = useInfiniteQuery({
    queryKey: ["inbox", "archive", filters],
    queryFn: ({ pageParam }) => fetchIboxPage({ status: "archive", ...filters }, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled: !!u,
  });
  const rooms = query.data?.pages.flatMap((page) => page.data) || [];

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
        <View className="mb-5 rounded-[24px] bg-ui-midnight p-5">
        <Text className="font-display text-3xl text-ui-paper" accessibilityRole="header">
            Conversations
          </Text>
          <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
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
          currentUserId={user?._id}
          rooms={rooms}
          isLoading={query.isLoading || gettingUser}
          error={query.error}
          mode="archive"
          isRefreshing={query.isRefetching}
          onRefresh={() => void query.refetch()}
          hasMore={Boolean(query.hasNextPage)}
          isLoadingMore={query.isFetchingNextPage}
          onLoadMore={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) {
              void query.fetchNextPage();
            }
          }}
          filters={filters}
          onFiltersChange={(next) => setFilters((current) => ({ ...current, ...next }))}
        />
      </View>
      <MobileNav />
    </>
  );
};

export default ChatInbox;
