import MobileNav from "@/src/components/MobileNav";
import NotificationBell from "@/src/components/notifications/NotificationBell";
import Skeleton from "@/src/components/ui/Skeleton";
import Tabs, { TabItem } from "@/src/components/ui/Tabs";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import { useNotificationSocketSync } from "@/src/hooks/useNotifications";
import { useUser } from "@/src/hooks/useUser";
import {
  fetchIboxPage,
  type MatchRoomParticipantSummary,
  type MatchRoomSummary,
} from "@/src/libs/apis";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import { calculateAge, triggerSelectionHaptic } from "@/src/utils";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";

type InboxTab = "active" | "archive";
export type InboxSort =
  | "recent"
  | "oldest"
  | "compatibility_desc"
  | "compatibility_asc"
  | "nearest"
  | "farthest";

const SORT_OPTIONS: { label: string; value: InboxSort }[] = [
  { label: "Most recent", value: "recent" },
  { label: "Oldest", value: "oldest" },
  { label: "Compatibility high", value: "compatibility_desc" },
  { label: "Compatibility low", value: "compatibility_asc" },
  { label: "Nearest match", value: "nearest" },
  { label: "Farthest match", value: "farthest" },
];

const SORT_ICONS: Record<InboxSort, string> = {
  recent: "Clock3",
  oldest: "History",
  compatibility_desc: "Sparkles",
  compatibility_asc: "Sparkles",
  nearest: "MapPin",
  farthest: "MapPin",
};

export interface InboxFiltersState {
  search: string;
  unreadOnly: boolean;
  sort: InboxSort;
}

interface InboxProps {
  currentUserId?: string;
  rooms: MatchRoomSummary[];
  isLoading: boolean;
  error?: unknown;
  mode: InboxTab;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  filters: InboxFiltersState;
  onFiltersChange: (next: Partial<InboxFiltersState>) => void;
}

interface UserChatProps {
  room: MatchRoomSummary;
  matchedUser?: MatchRoomParticipantSummary;
}

interface MetaProps {
  icon: string;
  text: string | number;
}

const ChatInbox = () => {
  const [activeTab, setActiveTab] = useState<InboxTab>("active");
  const [filters, setFilters] = useState<InboxFiltersState>({
    search: "",
    unreadOnly: false,
    sort: "recent",
  });
  const currentUser = getUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket, revalidateSocket } = useSocket();
  const { user, isLoading: gettingUser } = useUser(currentUser?._id ?? "");

  const activeQuery = useInfiniteQuery({
    queryKey: ["inbox", "active", filters],
    queryFn: ({ pageParam }) => fetchIboxPage({ status: "active", ...filters }, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
    enabled: !!currentUser,
  });

  const archiveQuery = useInfiniteQuery({
    queryKey: ["inbox", "archive", filters],
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

  useNotificationSocketSync();

  return (
    <>
      <View className="flex-1 bg-ui-surface-page px-4 pt-5">
        <View className="mb-5 rounded-[24px] bg-ui-midnight p-5">
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
        </View>

        <InboxTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCount={activeRooms.length}
          archiveCount={archiveRooms.length}
        />

        <Inbox
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

export const InboxTabs = React.memo(function InboxTabs({
  activeTab,
  onTabChange,
  activeCount,
  archiveCount,
}: {
  activeTab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  activeCount?: number;
  archiveCount?: number;
}) {
  const tabs: TabItem[] = useMemo(
    () => [
      { key: "active", label: "Active", count: activeCount },
      { key: "archive", label: "Archived", count: archiveCount },
    ],
    [activeCount, archiveCount],
  );

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onSelect={(key) => onTabChange(key as InboxTab)}
      showBadges
      hapticFeedback={true}
    />
  );
});

export const Inbox = React.memo(function Inbox({
  currentUserId,
  rooms,
  isLoading,
  error,
  mode,
  isRefreshing = false,
  onRefresh,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  filters,
  onFiltersChange,
}: InboxProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [filterDraft, setFilterDraft] = useState(filters);
  useEffect(() => {
    setSearchDraft(filters.search);
    setFilterDraft(filters);
  }, [filters]);
  useEffect(() => {
    if (searchDraft === filters.search) return;
    const timer = setTimeout(() => {
      onFiltersChange({ search: searchDraft });
    }, 350);
    return () => clearTimeout(timer);
  }, [filters.search, onFiltersChange, searchDraft]);
  const hasActiveFilters = Boolean(
    filters.search || filters.unreadOnly || filters.sort !== "recent",
  );
  const selectedSortLabel = SORT_OPTIONS.find((option) => option.value === filters.sort)?.label;

  const renderItem = useCallback<ListRenderItem<MatchRoomSummary>>(
    ({ item: room }) => {
      const matchedUser = room.participants?.find(
        (participant) => participant._id !== currentUserId,
      );
      return <UserChat room={room} matchedUser={matchedUser} />;
    },
    [currentUserId],
  );

  if (error) {
    return <InboxState mode={mode} type="error" onAction={onRefresh} />;
  }

  if (!isLoading && !rooms?.length && !hasActiveFilters) {
    return <InboxState mode={mode} type="empty" onAction={onRefresh} />;
  }

  const conversationToolbar = (
    <View className="gap-3 pb-3">
      <View className="flex-row items-center gap-2">
        <View className="h-12 flex-1 flex-row items-center rounded-full border border-ui-parchment bg-ui-paper px-4">
          <Icon name="Search" size={18} color={COLORS.slate} />
          <TextInput
            value={searchDraft}
            onChangeText={setSearchDraft}
            placeholder="Search conversations"
            placeholderTextColor={COLORS.slate}
            className="ml-2 flex-1 text-sm text-ui-ink"
            returnKeyType="search"
            accessibilityLabel="Search conversations"
          />
          {searchDraft ? (
            <Pressable
              onPress={() => {
                setSearchDraft("");
                onFiltersChange({ search: "" });
              }}
              className="h-8 w-8 items-center justify-center rounded-full"
              accessibilityRole="button"
              accessibilityLabel="Clear conversation search"
            >
              <Icon name="X" size={16} color={COLORS.slate} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => {
            setFilterDraft(filters);
            setIsFilterOpen(true);
          }}
          className="h-12 w-12 items-center justify-center rounded-full border border-ui-parchment bg-ui-paper active:opacity-70"
          accessibilityRole="button"
          accessibilityLabel="Filter and sort conversations"
        >
          <Icon name="SlidersHorizontal" size={19} color={COLORS.forest} />
        </Pressable>
      </View>
      {filters.unreadOnly || filters.sort !== "recent" ? (
        <View className="flex-row flex-wrap items-center gap-2">
          {filters.unreadOnly ? (
            <View className="rounded-full bg-ui-forest/10 px-3 py-1.5">
              <Text className="text-xs font-semibold text-ui-forest">Unread only</Text>
            </View>
          ) : null}
          {filters.sort !== "recent" ? (
            <View className="rounded-full bg-ui-champagne/30 px-3 py-1.5">
              <Text className="text-xs font-semibold text-ui-ink">{selectedSortLabel}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );

  return (
    <>
      {conversationToolbar}
      {isLoading ? <InboxSkeleton /> : <FlatList
      data={rooms}
      keyExtractor={(room) => String(room._id)}
      contentContainerStyle={{ paddingBottom: 24 }}
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews={Platform.OS === "android"}
      renderItem={renderItem}
      ListEmptyComponent={
        hasActiveFilters ? (
          <View className="items-center px-6 py-10">
            <Icon name="SearchX" size={28} color={COLORS.slate} />
            <Text className="mt-3 text-center text-base font-semibold text-ui-ink">
              No conversations match these filters
            </Text>
            <Text className="mt-1 text-center text-sm text-ui-slate">
              Try another name or clear the filter.
            </Text>
            <Pressable
              onPress={() => {
                setSearchDraft("");
                setFilterDraft({ search: "", unreadOnly: false, sort: "recent" });
                onFiltersChange({ search: "", unreadOnly: false, sort: "recent" });
              }}
              className="mt-4 min-h-11 justify-center rounded-2xl bg-ui-forest px-5"
              accessibilityRole="button"
              accessibilityLabel="Clear conversation filters"
            >
              <Text className="font-semibold text-ui-paper">Clear filters</Text>
            </Pressable>
          </View>
        ) : null
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.4}
      ListFooterComponent={
        isLoadingMore ? (
          <View className="items-center py-5">
            <ActivityIndicator color={COLORS.forest} />
          </View>
        ) : hasMore ? (
          <View className="h-4" />
        ) : null
      }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.forest}
            colors={[COLORS.forest]}
          />
        ) : undefined
      }
      />}
      <Actionsheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="rounded-t-[32px] bg-ui-surface-page px-5 pb-8 pt-2">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <Text className="mb-4 mt-3 text-2xl font-semibold text-ui-midnight">
          Filter conversations
        </Text>
        <Text className="-mt-2 mb-5 text-sm leading-5 text-ui-slate">
          Find the right conversation faster.
        </Text>
        <Pressable
          onPress={() => setFilterDraft((current) => ({ ...current, unreadOnly: !current.unreadOnly }))}
          className={`mb-5 flex-row items-center justify-between rounded-[22px] border px-4 py-3.5 ${filterDraft.unreadOnly ? "border-ui-forest/20 bg-ui-forest/10" : "border-ui-parchment bg-ui-paper"}`}
          accessibilityRole="switch"
          accessibilityLabel="Unread conversations only"
          accessibilityState={{ checked: filterDraft.unreadOnly }}
        >
          <View className="flex-row items-center gap-3">
            <View className={`h-10 w-10 items-center justify-center rounded-full ${filterDraft.unreadOnly ? "bg-ui-forest" : "bg-ui-forest/10"}`}>
              <Icon name="MailOpen" size={18} color={filterDraft.unreadOnly ? COLORS.paper : COLORS.forest} />
            </View>
            <View>
              <Text className="font-bold text-ui-ink">Unread only</Text>
              <Text className="mt-0.5 text-xs text-ui-slate">
                Show conversations waiting for you
              </Text>
            </View>
          </View>
          <View className={`h-6 w-11 rounded-full p-1 ${filterDraft.unreadOnly ? "bg-ui-forest" : "bg-ui-parchment"}`}>
            <View className={`h-4 w-4 rounded-full bg-ui-paper ${filterDraft.unreadOnly ? "ml-5" : ""}`} />
          </View>
        </Pressable>
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xs font-bold uppercase tracking-wider text-ui-slate">
          Sort by
          </Text>
          {filterDraft.sort !== "recent" || filterDraft.unreadOnly ? (
            <Pressable
              onPress={() => setFilterDraft((current) => ({ ...current, sort: "recent", unreadOnly: false }))}
              className="min-h-9 justify-center px-2"
              accessibilityRole="button"
              accessibilityLabel="Clear conversation filters"
            >
              <Text className="text-xs font-bold text-ui-forest">Reset</Text>
            </Pressable>
          ) : null}
        </View>
        <View className="flex-row flex-wrap justify-between gap-y-2.5">
          {SORT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                setFilterDraft((current) => ({ ...current, sort: option.value }));
              }}
              className={`min-h-[62px] w-[48.5%] flex-row items-center justify-between rounded-[20px] border px-3.5 ${filterDraft.sort === option.value ? "border-ui-forest/20 bg-ui-forest/10" : "border-ui-parchment bg-ui-paper"}`}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: filterDraft.sort === option.value }}
            >
              <View className="flex-1 flex-row items-center gap-2">
                <Icon
                  name={SORT_ICONS[option.value]}
                  size={16}
                  color={filterDraft.sort === option.value ? COLORS.forest : COLORS.slate}
                />
                <Text className={`flex-1 text-sm font-semibold leading-5 ${filterDraft.sort === option.value ? "text-ui-forest" : "text-ui-ink"}`}>
                {option.label}
                </Text>
              </View>
              {filterDraft.sort === option.value ? (
                <Icon name="Check" size={18} color={COLORS.forest} />
              ) : null}
            </Pressable>
          ))}
        </View>
        <Pressable
          onPress={() => {
            onFiltersChange(filterDraft);
            setIsFilterOpen(false);
          }}
          className="mt-5 px-6 min-h-12 items-center justify-center rounded-2xl bg-ui-forest active:opacity-85"
          accessibilityRole="button"
          accessibilityLabel="Apply conversation filters"
        >
          <Text className="font-bold text-ui-paper">Apply filters</Text>
        </Pressable>
      </ActionsheetContent>
    </Actionsheet>
    </>
  );
});

const decodeLastMessage = (room: MatchRoomSummary) => {
  const lastMessage = room?.lastMessage;
  if (!lastMessage) return "";

  if (
    lastMessage.previewType === "image" ||
    lastMessage.messageType === "image"
  ) {
    return "Photo";
  }

  if (
    lastMessage.previewType === "audio" ||
    lastMessage.messageType === "audio"
  ) {
    return "Voice note";
  }

  if (!lastMessage.message) return "New message";
  return lastMessage.message;
};

const getLastMessageIcon = (room: MatchRoomSummary) => {
  const type =
    room?.lastMessage?.previewType || room?.lastMessage?.messageType || "text";
  if (type === "image") return "Image";
  if (type === "audio") return "Mic";
  return "MessageCircle";
};

const formatInboxDate = (value: unknown) => {
  if (!value) return "";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const UserChat = React.memo(function UserChat({
  room,
  matchedUser,
}: UserChatProps) {
  const { user, isLoading, error } = useUser(matchedUser?._id ?? "");
  const [failedProfilePicture, setFailedProfilePicture] = useState(false);
  useEffect(() => setFailedProfilePicture(false), [user?.profilePicture]);
  const unreadCount = Number(room?.unreadCount || 0);
  const lastMessagePreview = useMemo(() => decodeLastMessage(room), [room]);
  const finalPreview = lastMessagePreview;
  const previewIcon = getLastMessageIcon(room);
  const isRoomMatch = room?.source === "location_room";
  const roomMatchTitle =
    room?.sourceMetadata?.title ||
    (typeof room.locationRoom === "object"
      ? room.locationRoom?.title
      : undefined) ||
    "Community";
  const isUserUnavailable = Boolean(error);
  const displayName = isUserUnavailable
    ? "Lumore User"
    : user?.isViewerUnlockedByUser
      ? user.realName || user.nickname || user.username || "Lumore User"
      : user?.nickname || "Lumore User";

  if (isLoading) {
    return <InboxItemSkeleton />;
  }

  const content = (
    <Pressable
      className={`flex-row items-center rounded-[24px] border px-3 py-3 active:opacity-75 ${
        unreadCount > 0
          ? "border-ui-forest/20 bg-ui-forest/5"
          : "border-ui-parchment bg-ui-paper"
      }`}
      disabled={isUserUnavailable}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}. ${unreadCount > 0 ? `${unreadCount} unread. ` : ""}${finalPreview || "No messages yet"}`}
      accessibilityHint={
        isUserUnavailable
          ? "This conversation is unavailable"
          : "Opens this conversation"
      }
      accessibilityState={{ disabled: isUserUnavailable }}
    >
      <View className="relative mr-3">
        <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-[20px] bg-ui-porcelain">
          {user?.profilePicture && !failedProfilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              contentFit="cover"
              transition={150}
              recyclingKey={user.profilePicture}
              blurRadius={user?.isViewerUnlockedByUser ? 0 : 12}
              className="h-full w-full"
              style={{ width: "100%", height: "100%" }}
              onError={() => setFailedProfilePicture(true)}
              accessible
              accessibilityLabel={`Profile photo of ${displayName}`}
            />
          ) : (
            <Text className="text-2xl font-bold text-ui-midnight">
              {displayName.charAt(0)}
            </Text>
          )}
        </View>

        <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border border-ui-parchment bg-ui-paper">
          {user?.isViewerUnlockedByUser && !isUserUnavailable ? (
            <Icon name="LockOpen" size={12} className="text-ui-ink" />
          ) : (
            <Icon name="Lock" size={12} className="text-ui-ink" />
          )}
        </View>
      </View>

      <View className="min-w-0 flex-1">
        <View className="mb-1 flex-row items-center gap-2">
          <Text
            className={`min-w-0 flex-1 text-base ${unreadCount > 0 ? "font-bold" : "font-semibold"}`}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          {isRoomMatch ? (
            <View className="self-start rounded-full bg-ui-forest/10 px-2 py-0.5">
              <Text className="text-xs font-semibold text-ui-forest">
                {roomMatchTitle}
              </Text>
            </View>
          ) : null}
        </View>

        {finalPreview ? (
          <View className="flex-row items-center gap-1.5">
            <Icon name={previewIcon} size={14} color={COLORS.slate} />
            <Text
              className={`min-w-0 flex-1 text-sm ${unreadCount > 0 ? "font-semibold text-ui-ink" : "text-ui-slate"}`}
              numberOfLines={1}
            >
              {finalPreview}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-3">
            {user?.dob && <Meta icon="Cake" text={calculateAge(user?.dob)} />}
            {user?.gender && <Meta icon="UserRound" text={user.gender} />}
            {user?.distance != null && (
              <Meta icon="Footprints" text={`${user.distance.toFixed(1)}km`} />
            )}
          </View>
        )}
      </View>

      <View className="ml-3 items-end gap-2">
        <Text className={`text-xs font-medium ${unreadCount > 0 ? "text-ui-forest" : "text-ui-slate"}`}>
          {formatInboxDate(room.lastMessageAt)}
        </Text>
        {unreadCount > 0 ? (
          <View className="h-6 min-w-6 items-center justify-center rounded-2xl bg-ui-forest px-1.5">
            <Text className="text-xs font-bold text-ui-paper">{unreadCount > 99 ? "99+" : unreadCount}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );

  return isUserUnavailable ? (
    <View className="mb-3 opacity-70">{content}</View>
  ) : (
    <Link className="mb-3" href={`/chat/${room._id}`} asChild>
      {content}
    </Link>
  );
});

export const Meta = React.memo(function Meta({ icon, text }: MetaProps) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon name={icon} size={16} className="!h-4 !w-4 text-ui-ink" />
      <Text className="text-xs font-medium text-ui-slate">{text}</Text>
    </View>
  );
});

const InboxState = ({
  mode,
  type,
  onAction,
}: {
  mode: InboxTab;
  type: "empty" | "error";
  onAction?: () => void;
}) => {
  const isError = type === "error";
  const title = isError
    ? "Messages are taking a moment"
    : mode === "archive"
      ? "Your archive is clear"
      : "Your next conversation starts here";
  const description = isError
    ? "We couldn't refresh your conversations. Check your connection and try again."
    : mode === "archive"
      ? "Chats you archive will stay safely tucked away here."
      : "Explore new connections and your active chats will appear here.";

  return (
    <View className="mt-6 items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon
          name={isError ? "CloudOff" : mode === "archive" ? "Archive" : "MessageCircleHeart"}
          size={26}
          color={COLORS.forest}
        />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-ink" accessibilityRole="header">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
        {description}
      </Text>
      {isError && onAction ? (
        <Pressable
          onPress={onAction}
          className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-ui-forest px-6 active:opacity-75"
          accessibilityRole="button"
          accessibilityLabel="Retry loading conversations"
        >
          <Text className="font-semibold text-ui-paper">Try again</Text>
        </Pressable>
      ) : !isError && mode === "active" ? (
        <Link href="/explore" asChild>
          <Pressable
            className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-6 active:opacity-75"
            accessibilityRole="button"
            accessibilityLabel="Explore new connections"
          >
            <Icon name="Sparkles" size={17} color={COLORS.paper} />
            <Text className="font-semibold text-ui-paper">Explore connections</Text>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
};

const InboxSkeleton = () => (
  <View className="mt-1 gap-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <InboxItemSkeleton key={`chat-skeleton-${index}`} />
    ))}
  </View>
);

const InboxItemSkeleton = () => (
  <View className="rounded-[24px] border border-ui-parchment bg-ui-paper px-3 py-3">
    <View className="flex-row items-center">
      <Skeleton width={56} height={56} radius={20} />
      <View className="flex-1 ml-4">
        <Skeleton width="55%" height={14} />
        <Skeleton width="82%" height={12} style={{ marginTop: 10 }} />
      </View>
      <View className="items-end ml-3">
        <Skeleton width={58} height={11} />
        <Skeleton
          width={24}
          height={24}
          radius={999}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  </View>
);
