import InboxState from "@/src/components/chat/InboxState";
import InboxSkeleton from "@/src/components/chat/InboxSkeleton";
import InboxFilterSheet from "@/src/components/chat/InboxFilterSheet";
import InboxSearchToolbar from "@/src/components/chat/InboxSearchToolbar";
import UserChat from "@/src/components/chat/UserChat";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import type {
  InboxFiltersState,
  InboxSort,
  InboxTab,
  MatchRoomSummary,
} from "@/src/domain/chat/inboxTypes";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  type ListRenderItem,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

interface InboxListProps {
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

const InboxList = React.memo(function InboxList({
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
}: InboxListProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  return (
    <>
      <InboxSearchToolbar
        filters={filters}
        selectedSortLabel={selectedSortLabel}
        onFiltersChange={onFiltersChange}
        onOpenFilters={() => setIsFilterOpen(true)}
      />
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
          <LumoreRefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
      />}
      <InboxFilterSheet
        isOpen={isFilterOpen}
        filters={filters}
        sortOptions={SORT_OPTIONS}
        sortIcons={SORT_ICONS}
        onClose={() => setIsFilterOpen(false)}
        onChange={onFiltersChange}
      />
    </>
  );
});

export default InboxList;
