import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  View,
} from "react-native";

import Button from "../components/ui/Button";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import NotificationCard from "../components/notifications/NotificationCard";
import NotificationFilters, { type NotificationFilter } from "../components/notifications/NotificationFilters";
import NotificationHeader from "../components/notifications/NotificationHeader";
import NotificationHero from "../components/notifications/NotificationHero";
import NotificationLoadingSkeleton from "../components/notifications/NotificationLoadingSkeleton";
import NotificationStates from "../components/notifications/NotificationStates";
import SubPageBack from "../components/headers/SubPageBack";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";
import invalidateNotifications from "../hooks/notifications/invalidateNotifications";
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
      await invalidateNotifications(queryClient);
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

  const { hasUnread, unreadCount, visibleItems } = useMemo(() => {
    let hasUnread = false;
    let unreadCount = 0;
    const visibleItems = filter === "unread" ? [] : items;

    for (const notification of items) {
      if (notification.isRead) continue;
      hasUnread = true;
      unreadCount += 1;
      if (filter === "unread") visibleItems.push(notification);
    }

    return { hasUnread, unreadCount, visibleItems };
  }, [filter, items]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-ui-surface-page">
        {onClose ? (
          <NotificationHeader onClose={onClose} showMarkAll={false} />
        ) : (
          <SubPageBack title="Notifications" fallbackHref="/explore" />
        )}
        <NotificationLoadingSkeleton />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ui-surface-page">
      {onClose ? (
        <NotificationHeader
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
          <NotificationStates state="error" onRefresh={handleRefresh} />
        ) : items.length === 0 ? (
          <NotificationStates state="empty" onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        ) : visibleItems.length === 0 && filter === "unread" ? (
          <NotificationStates state="unread-empty" onShowAll={() => setFilter("all")} />
        ) : (
          <FlatList
            data={visibleItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerClassName="gap-3 px-4 pb-12 pt-4"
            refreshControl={
              <LumoreRefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              <View className="py-3">
                {isFetchingMore ? (
                  <ActivityIndicator color={COLORS.forest} />
                ) : hasMore ? (
                  <Button
                    text="Load more"
                    variant="outline"
                    onClick={loadMore}
                    className="rounded-2xl"
                  />
                ) : visibleItems.length >= 10 ? (
                  <Text className="text-center text-xs text-ui-ink/60">
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
          <View className="flex-row items-center gap-2 rounded-2xl bg-ui-danger/5 px-4 py-3">
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

export default NotificationsScreen;
