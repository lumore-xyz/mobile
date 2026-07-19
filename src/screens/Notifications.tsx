import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import NotificationCard from "../components/notifications/NotificationCard";
import SubPageBack from "../components/headers/SubPageBack";
import {
  NOTIFICATION_QUERY_KEYS,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";
import {
  resolveNotificationTarget,
  navigateToNotification,
} from "../libs/notifications/router";
import type { NotificationItem } from "../libs/notifications/constants";
import Icon from "../libs/Icon";
import { COLORS } from "../libs/constants/theme";
import { triggerSelectionHaptic } from "../utils/haptics";

interface NotificationsScreenProps {
  onClose?: () => void;
}

type NotificationFilter = "all" | "unread";

const goBack = () => {
  triggerSelectionHaptic();
  if (typeof router.canGoBack === "function" && router.canGoBack()) {
    router.back();
  } else {
    router.navigate("/explore" as any);
  }
};

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onClose,
}) => {
  const {
    items,
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    loadMore,
  } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const removeNotification = useDeleteNotification();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("all");

  // invalidateQueries will refetch both the list and the unread-count query;
  // calling refetch() separately just duplicates the request.
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.root,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  const handleNotificationPress = useCallback(
    (notification: NotificationItem) => {
      if (!notification.isRead) {
        markRead.mutate(notification.id);
      }
      const hasTarget = Boolean(resolveNotificationTarget(notification));
      if (!hasTarget) return;
      navigateToNotification(notification);
      if (onClose) onClose();
    },
    [markRead, onClose],
  );

  const handleDelete = useCallback(
    (notification: NotificationItem) => {
      triggerSelectionHaptic();
      Alert.alert(
        "Delete notification?",
        "This notification will be permanently removed.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => removeNotification.mutate(notification.id),
          },
        ],
      );
    },
    [removeNotification],
  );

  const handleMarkAllRead = useCallback(() => {
    triggerSelectionHaptic();
    markAllRead.mutate();
  }, [markAllRead]);

  const renderItem = useCallback(
    ({ item }: { item: NotificationItem }) => (
      <NotificationCard
        notification={item}
        onPress={handleNotificationPress}
        onDelete={handleDelete}
        isDeleting={removeNotification.isPending}
      />
    ),
    [handleNotificationPress, handleDelete, removeNotification.isPending],
  );

  const keyExtractor = useCallback((item: NotificationItem) => item.id, []);

  const hasUnread = items.some((notification) => !notification.isRead);
  const unreadCount = items.filter((notification) => !notification.isRead).length;
  const visibleItems =
    filter === "unread"
      ? items.filter((notification) => !notification.isRead)
      : items;

  if (isLoading) {
    return (
      <View className="flex-1 bg-ui-surface-page">
        {onClose ? (
          <ScreenHeader onClose={onClose} showMarkAll={false} />
        ) : (
          <SubPageBack title="Notifications" fallbackHref="/explore" />
        )}
        <View className="px-4 pb-5 pt-3">
          <NotificationHeroSkeleton />
        </View>
        <View className="gap-3 px-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <NotificationSkeleton key={index} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ui-surface-page">
      {onClose ? (
        <ScreenHeader
          onClose={onClose}
          showMarkAll={hasUnread && !markAllRead.isPending}
          onMarkAll={handleMarkAllRead}
          isMarkingAll={markAllRead.isPending}
        />
      ) : (
        <SubPageBack title="Notifications" fallbackHref="/explore" />
      )}

      <View className="flex-1">
        <NotificationHero
          unreadCount={unreadCount}
          totalCount={items.length}
          showMarkAll={!onClose && hasUnread}
          onMarkAll={handleMarkAllRead}
          isMarkingAll={markAllRead.isPending}
        />
        {items.length > 0 ? (
          <NotificationFilters
            filter={filter}
            onChange={setFilter}
            totalCount={items.length}
            unreadCount={unreadCount}
          />
        ) : null}
        {items.length === 0 && error ? (
          <NotificationErrorState onRetry={handleRefresh} />
        ) : items.length === 0 ? (
          <EmptyState onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        ) : visibleItems.length === 0 && filter === "unread" ? (
          <UnreadEmptyState onShowAll={() => setFilter("all")} />
        ) : (
          <FlatList
            data={visibleItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerClassName="gap-3 px-4 pb-12 pt-4"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.highlight}
                colors={[COLORS.highlight]}
              />
            }
            onEndReached={() => {
              if (hasMore && !isFetchingMore) {
                loadMore();
              }
            }}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              <View className="py-3">
                {isFetchingMore ? (
                  <ActivityIndicator color={COLORS.highlight} />
                ) : hasMore ? (
                  <Button
                    text="Load more"
                    variant="outline"
                    onClick={loadMore}
                    className="rounded-2xl"
                  />
                ) : visibleItems.length >= 10 ? (
                  <Text className="text-center text-xs text-ui-shade/60">
                    You&apos;re all caught up.
                  </Text>
                ) : null}
              </View>
            }
          />
        )}
      </View>

      {error && items.length > 0 ? (
        <View className="px-4 pb-4" accessibilityLiveRegion="polite">
          <View className="flex-row items-center gap-2 rounded-2xl bg-red-50 px-4 py-3">
            <Icon name="CircleAlert" size={18} color={COLORS.danger} />
            <Text className="flex-1 text-sm text-ui-danger">
              Could not refresh notifications. Pull down to try again.
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
};

interface ScreenHeaderProps {
  onClose?: () => void;
  showMarkAll: boolean;
  onMarkAll?: () => void;
  isMarkingAll?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  onClose,
  showMarkAll,
  onMarkAll,
  isMarkingAll = false,
}) => {
  // Modal mode (onClose present): "×" + centered title + right action.
  // Standalone mode: back arrow + title + right action.
  if (onClose) {
    return (
      <View className="h-16 flex-row items-center justify-between border-b border-ui-border bg-ui-light px-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close notifications"
          onPress={onClose}
          className="h-11 w-11 items-center justify-center rounded-full bg-ui-highlight/5 active:opacity-70"
        >
          <Icon name="X" size={20} color={COLORS.shade} />
        </Pressable>
        <Text className="text-base font-semibold text-ui-dark">
          Notifications
        </Text>
        {(showMarkAll || isMarkingAll) && onMarkAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mark all read"
            onPress={onMarkAll}
            disabled={isMarkingAll}
            accessibilityState={{ disabled: isMarkingAll, busy: isMarkingAll }}
            className="min-h-11 items-center justify-center rounded-full bg-ui-highlight/10 px-3 active:opacity-70"
          >
            {isMarkingAll ? (
              <ActivityIndicator size="small" color={COLORS.highlight} />
            ) : (
              <Text className="text-xs font-semibold text-ui-highlight">Mark all read</Text>
            )}
          </Pressable>
        ) : (
          <View className="w-10" />
        )}
      </View>
    );
  }

  return (
    <View className="flex-row items-center bg-ui-surface-page px-4 pb-2 pt-4">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={goBack}
        className="h-11 w-11 items-center justify-center rounded-full active:bg-ui-highlight/5"
        hitSlop={8}
      >
        <Icon
          name="ArrowLeft"
          size={24}
          color={COLORS.shade}
        />
      </Pressable>
      <View className="flex-1 px-3">
        <Text className="text-[28px] font-bold leading-8 text-ui-shade" accessibilityRole="header">
          Notifications
        </Text>
        <Text className="mt-0.5 text-xs text-ui-muted">
          The moments worth coming back to
        </Text>
      </View>
      {(showMarkAll || isMarkingAll) && onMarkAll ? (
        <Pressable
          onPress={onMarkAll}
          disabled={isMarkingAll}
          accessibilityRole="button"
          accessibilityLabel="Mark all notifications as read"
          accessibilityState={{ disabled: isMarkingAll, busy: isMarkingAll }}
          className="min-h-11 justify-center rounded-full bg-ui-highlight/10 px-3 active:opacity-70"
        >
          {isMarkingAll ? (
            <ActivityIndicator size="small" color={COLORS.highlight} />
          ) : (
            <Text className="text-sm font-semibold text-ui-highlight">Mark all read</Text>
          )}
        </Pressable>
      ) : (
        <View className="w-11" />
      )}
    </View>
  );
};

const NotificationHero = ({
  unreadCount,
  totalCount,
  showMarkAll,
  onMarkAll,
  isMarkingAll,
}: {
  unreadCount: number;
  totalCount: number;
  showMarkAll: boolean;
  onMarkAll: () => void;
  isMarkingAll: boolean;
}) => {
  const hasUnread = unreadCount > 0;
  const countLabel = hasUnread
    ? `${unreadCount} unread ${unreadCount === 1 ? "update" : "updates"}`
    : totalCount > 0
      ? "Everything is read"
      : "A calm inbox";

  return (
    <View className="mx-4 mt-3 overflow-hidden rounded-[28px] bg-ui-foreground p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-ui-light" accessibilityRole="header">
            What needs your attention
          </Text>
          <Text className="mt-1 text-sm leading-5 text-ui-light/70">
            Matches, messages, feedback, and community moments gathered in one place.
          </Text>
        </View>
        <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-primary">
          <Icon
            name={hasUnread ? "BellRing" : "Check"}
            size={20}
            color={COLORS.shade}
          />
        </View>
      </View>

      <View className="mt-5 flex-row items-end justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-3xl font-bold text-ui-light">
            {hasUnread ? unreadCount : totalCount}
          </Text>
          <Text className="mt-0.5 text-sm text-ui-light/70">
            {countLabel}
          </Text>
        </View>
        {showMarkAll ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
            accessibilityState={{ disabled: isMarkingAll, busy: isMarkingAll }}
            disabled={isMarkingAll}
            onPress={onMarkAll}
            className="min-h-11 items-center justify-center rounded-full bg-ui-light/10 px-4 active:opacity-75"
          >
            {isMarkingAll ? (
              <ActivityIndicator size="small" color={COLORS.light} />
            ) : (
              <Text className="text-sm font-semibold text-ui-light">
                Mark all
              </Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const NotificationHeroSkeleton: React.FC = () => (
  <View className="overflow-hidden rounded-[28px] bg-ui-foreground p-5">
    <View className="flex-row items-start justify-between gap-4">
      <View className="flex-1">
        <Skeleton width="72%" height={24} />
        <Skeleton width="92%" height={12} style={{ marginTop: 10 }} />
        <Skeleton width="70%" height={12} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width={44} height={44} radius={9999} />
    </View>
    <Skeleton width={56} height={30} style={{ marginTop: 20 }} />
    <Skeleton width="42%" height={12} style={{ marginTop: 8 }} />
  </View>
);

const NotificationSkeleton: React.FC = () => (
  <View className="flex-row gap-3 rounded-[24px] border border-ui-border bg-ui-light p-4">
    <Skeleton width={40} height={40} radius={9999} />
    <View className="flex-1 gap-2">
      <Skeleton width="55%" height={14} />
      <Skeleton width="100%" height={12} />
      <Skeleton width="80%" height={12} />
    </View>
  </View>
);

const NotificationFilters = ({
  filter,
  onChange,
  totalCount,
  unreadCount,
}: {
  filter: NotificationFilter;
  onChange: (filter: NotificationFilter) => void;
  totalCount: number;
  unreadCount: number;
}) => (
  <View
    className="mx-4 mt-3 flex-row rounded-full border border-ui-border bg-ui-light p-1.5"
    accessibilityRole="tablist"
  >
    {([
      { key: "all" as const, label: "All", count: totalCount },
      { key: "unread" as const, label: "Unread", count: unreadCount },
    ]).map((item) => {
      const selected = filter === item.key;
      return (
        <Pressable
          key={item.key}
          onPress={() => {
            if (!selected) {
              triggerSelectionHaptic();
              onChange(item.key);
            }
          }}
          className={`min-h-11 flex-1 flex-row items-center justify-center gap-2 rounded-full px-3 active:opacity-75 ${
            selected ? "bg-ui-highlight" : "bg-transparent"
          }`}
          accessibilityRole="tab"
          accessibilityLabel={`${item.label}, ${item.count}`}
          accessibilityState={{ selected }}
        >
          <Text
            className={`text-sm font-semibold ${selected ? "text-ui-light" : "text-ui-muted"}`}
          >
            {item.label}
          </Text>
          <View
            className={`min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 ${
              selected ? "bg-ui-primary" : "bg-ui-shade/10"
            }`}
          >
            <Text className="text-xs font-bold text-ui-shade">{item.count}</Text>
          </View>
        </Pressable>
      );
    })}
  </View>
);

const UnreadEmptyState = ({ onShowAll }: { onShowAll: () => void }) => (
  <View className="mx-4 mt-6 items-center rounded-[28px] border border-ui-border bg-ui-light px-6 py-8">
    <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-highlight/10">
      <Icon name="CheckCheck" size={24} color={COLORS.highlight} />
    </View>
    <Text className="mt-4 text-center text-xl font-bold text-ui-shade">
      No unread updates
    </Text>
    <Text className="mt-2 text-center text-sm leading-5 text-ui-muted">
      You have seen everything new. Your earlier notifications are still available.
    </Text>
    <Button
      variant="outline"
      text="Show all notifications"
      onClick={onShowAll}
      className="mt-5 px-6"
    />
  </View>
);

interface EmptyStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onRefresh, isRefreshing }) => (
  <ScrollView
    className="flex-1"
    contentContainerClassName="px-4 pb-10 pt-5"
    refreshControl={
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        tintColor={COLORS.highlight}
        colors={[COLORS.highlight]}
      />
    }
  >
    <View className="items-center rounded-[28px] border border-ui-border bg-ui-light px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-highlight/10">
        <Icon name="Bell" size={24} color={COLORS.highlight} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-shade">
        You&apos;re all caught up
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-muted">
        New matches, feedback, verification updates, and community activity will
        show up here.
      </Text>
      <Button
        variant="outline"
        text={isRefreshing ? "Refreshing..." : "Refresh"}
        onClick={onRefresh}
        className="mt-5 px-6"
      />
    </View>
  </ScrollView>
);

const NotificationErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <View
    className="mx-4 mt-8 items-center rounded-[28px] border border-ui-border bg-ui-light px-6 py-8"
    accessibilityLiveRegion="polite"
  >
    <View className="h-14 w-14 items-center justify-center rounded-full bg-red-50">
      <Icon name="CloudOff" size={24} color={COLORS.danger} />
    </View>
    <Text className="mt-4 text-center text-xl font-bold text-ui-shade">
      Notifications are taking a moment
    </Text>
    <Text className="mt-2 text-center text-sm leading-5 text-ui-muted">
      We could not load your updates. Check your connection and try again.
    </Text>
    <Button text="Try again" onClick={onRetry} className="mt-5 px-6" />
  </View>
);

export default NotificationsScreen;
