import SurfacePanel from "@/src/components/ui/SurfacePanel";
import MobileNav from "@/src/components/MobileNav";
import type { InboxFiltersState } from "@/src/domain/chat/inboxTypes";
import useInboxSocketSync from "@/src/hooks/useInboxSocketSync";
import { useUser } from "@/src/hooks/useUser";
import { fetchIboxPage } from "@/src/features/chat/api";
import { inboxQueryKeys } from "@/src/features/chat/inboxQueryKeys";
import { getUser } from "@/src/service/storage";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import InboxList from "@/src/components/chat/InboxList";
import InboxTabs from "@/src/components/chat/InboxTabs";

const ChatInbox = () => {
  const u = getUser();
  const router = useRouter();
  const [filters, setFilters] = React.useState<InboxFiltersState>({
    search: "",
    unreadOnly: false,
    sort: "recent",
  });
  const { user, isLoading: gettingUser } = useUser(u?._id);
  useInboxSocketSync();

  const query = useInfiniteQuery({
    queryKey: inboxQueryKeys.archivedList(filters),
    queryFn: ({ pageParam }) => fetchIboxPage({ status: "archive", ...filters }, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled: !!u,
  });
  const rooms = query.data?.pages.flatMap((page) => page.data) || [];

  return (
    <>
      <View className="flex-1 bg-ui-surface-page px-4 pt-5">
        <SurfacePanel surface="midnight" className="mb-5">
        <Text className="font-display text-3xl text-ui-paper" accessibilityRole="header">
            Conversations
          </Text>
          <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
            Revisit connections whenever the moment feels right.
          </Text>
        </SurfacePanel>

        <InboxTabs
          activeTab="archive"
          archiveCount={rooms.length}
          onTabChange={(tab) => {
            if (tab === "active") router.replace("/chat");
          }}
        />

        <InboxList
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
