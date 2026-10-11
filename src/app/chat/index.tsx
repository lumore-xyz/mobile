import SurfacePanel from "@/src/components/ui/SurfacePanel";
import MobileNav from "@/src/components/MobileNav";
import NotificationBell from "@/src/components/notifications/NotificationBell";
import InboxList from "@/src/components/chat/InboxList";
import InboxTabs from "@/src/components/chat/InboxTabs";
import type { InboxFiltersState, InboxTab } from "@/src/domain/chat/inboxTypes";
import useInboxSocketSync from "@/src/hooks/useInboxSocketSync";
import { useNotificationSocketSync } from "@/src/hooks/useNotifications";
import { useUser } from "@/src/hooks/useUser";
import { fetchIboxPage } from "@/src/features/chat/api";
import { inboxQueryKeys } from "@/src/features/chat/inboxQueryKeys";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { getUser } from "@/src/service/storage";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

const ChatInbox = () => {
  const [activeTab, setActiveTab] = useState<InboxTab>("active");
  const [filters, setFilters] = useState<InboxFiltersState>({
    search: "",
    unreadOnly: false,
    sort: "recent",
  });
  const currentUser = getUser();
  const router = useRouter();
  const { user, isLoading: gettingUser } = useUser(currentUser?._id ?? "");

  const activeQuery = useInfiniteQuery({
    queryKey: inboxQueryKeys.activeList(filters),
    queryFn: ({ pageParam }) => fetchIboxPage({ status: "active", ...filters }, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled: !!currentUser,
  });

  const archiveQuery = useInfiniteQuery({
    queryKey: inboxQueryKeys.archivedList(filters),
    queryFn: ({ pageParam }) => fetchIboxPage({ status: "archive", ...filters }, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled: !!currentUser,
  });

  const activeRooms = useMemo(
    () => activeQuery.data?.pages.flatMap((page) => page.data) || [],
    [activeQuery.data],
  );
  const archiveRooms = useMemo(
    () => archiveQuery.data?.pages.flatMap((page) => page.data) || [],
    [archiveQuery.data],
  );

  const rooms = activeTab === "active" ? activeRooms : archiveRooms;
  const isLoading = activeTab === "active" ? activeQuery.isLoading : archiveQuery.isLoading;
  const error = activeTab === "active" ? activeQuery.error : archiveQuery.error;
  const isRefreshing =
    activeTab === "active" ? activeQuery.isRefetching : archiveQuery.isRefetching;
  const refreshInbox =
    activeTab === "active" ? activeQuery.refetch : archiveQuery.refetch;
  const loadMore = activeTab === "active"
    ? activeQuery.fetchNextPage
    : archiveQuery.fetchNextPage;
  const hasMore = activeTab === "active"
    ? Boolean(activeQuery.hasNextPage)
    : Boolean(archiveQuery.hasNextPage);
  const isLoadingMore = activeTab === "active"
    ? activeQuery.isFetchingNextPage
    : archiveQuery.isFetchingNextPage;
  const handleRefresh = useCallback(() => {
    void refreshInbox();
  }, [refreshInbox]);
  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) void loadMore();
  }, [hasMore, isLoadingMore, loadMore]);
  const activeUnreadCount = useMemo(
    () =>
      activeRooms.reduce(
        (total, room) => total + Number(room?.unreadCount || 0),
        0,
      ),
    [activeRooms],
  );
  const updateFilters = useCallback(
    (next: Partial<InboxFiltersState>) => {
      setFilters((current) => ({ ...current, ...next }));
    },
    [],
  );

  useInboxSocketSync();

  useNotificationSocketSync();

  return (
    <>
      <View className="flex-1 bg-ui-surface-page px-4 pt-5">
        <SurfacePanel surface="midnight" className="mb-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="font-display text-3xl text-ui-paper" accessibilityRole="header">
                Conversations
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
                Keep the spark going, one message at a time.
              </Text>
            </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                triggerSelectionHaptic();
                router.push("/feedback");
              }}
              className="h-11 w-11 items-center justify-center rounded-full bg-ui-paper/10 active:opacity-70"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Share chat feedback"
            >
              <Icon name="MessageCircleMore" size={20} color={COLORS.paper} />
            </Pressable>
            <NotificationBell
              iconColor={COLORS.paper}
              className="bg-ui-paper/10"
            />
          </View>
          </View>
          {activeUnreadCount > 0 ? (
            <View className="mt-4 self-start rounded-full bg-ui-champagne px-3 py-1.5">
              <Text className="text-xs font-bold text-ui-ink">
                {activeUnreadCount} unread {activeUnreadCount === 1 ? "message" : "messages"}
              </Text>
            </View>
          ) : null}
        </SurfacePanel>

        <InboxTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCount={activeRooms.length}
          archiveCount={archiveRooms.length}
        />

        <InboxList
          currentUserId={user?._id}
          rooms={rooms}
          isLoading={isLoading || gettingUser}
          error={error}
          mode={activeTab}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          onLoadMore={handleLoadMore}
          filters={filters}
          onFiltersChange={updateFilters}
        />
      </View>
      <MobileNav />
    </>
  );
};

export default ChatInbox;

