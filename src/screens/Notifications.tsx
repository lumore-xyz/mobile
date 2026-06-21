import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import NotificationCard from "../components/notifications/NotificationCard";
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
import { triggerSelectionHaptic } from "../utils/haptics";

interface NotificationsScreenProps {
  onClose?: () => void;
}

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
    refetch,
    loadMore,
  } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const removeNotification = useDeleteNotification();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // invalidateQueries will refetch both the list and the unread-count query;
  // calling refetch() separately just duplicates the request.
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.root,
      });
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, refetch]);

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
      removeNotification.mutate(notification.id);
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
      />
    ),
    [handleNotificationPress, handleDelete],
  );

  const keyExtractor = useCallback((item: NotificationItem) => item.id, []);

  const hasUnread = items.some((notification) => !notification.isRead);

  if (isLoading) {
    return (
      <View className="flex-1 bg-ui-light">
        <ScreenHeader onClose={onClose} showMarkAll={false} />
        <View className="gap-3 px-4 py-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <NotificationSkeleton key={index} />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ui-light">
      <ScreenHeader
        onClose={onClose}
        showMarkAll={hasUnread && !markAllRead.isPending}
        onMarkAll={handleMarkAllRead}
      />

      <View className="flex-1">
        {items.length === 0 ? (
          <EmptyState onRefresh={handleRefresh} isRefreshing={isRefreshing} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerClassName="gap-3 px-4 pb-12 pt-3"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor="#541388"
                colors={["#541388"]}
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
                  <ActivityIndicator color="#541388" />
                ) : hasMore ? (
                  <Button
                    text="Load more"
                    variant="outline"
                    onClick={loadMore}
                    className="rounded-2xl"
                  />
                ) : items.length >= 10 ? (
                  <Text className="text-center text-xs text-ui-shade/60">
                    You&apos;re all caught up.
                  </Text>
                ) : null}
              </View>
            }
          />
        )}
      </View>

      {error ? (
        <View className="px-4 pb-4">
          <Text className="text-center text-sm text-red-500">
            Could not refresh notifications. Pull to retry.
          </Text>
        </View>
      ) : null}
    </View>
  );
};

interface ScreenHeaderProps {
  onClose?: () => void;
  showMarkAll: boolean;
  onMarkAll?: () => void;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  onClose,
  showMarkAll,
  onMarkAll,
}) => {
  // Modal mode (onClose present): "×" + centered title + right action.
  // Standalone mode: back arrow + title + right action.
  if (onClose) {
    return (
      <View className="h-16 flex-row items-center justify-between border-b border-ui-shade/10 bg-white px-4">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close notifications"
          onPress={onClose}
          className="h-10 w-10 items-center justify-center rounded-full bg-ui-shade/5"
        >
          <Text className="text-lg font-semibold text-ui-dark">{"×"}</Text>
        </TouchableOpacity>
        <Text className="text-base font-semibold text-ui-dark">
          Notifications
        </Text>
        {showMarkAll && onMarkAll ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Mark all read"
            onPress={onMarkAll}
            className="h-10 items-center justify-center rounded-full bg-ui-highlight/10 px-3"
          >
            <Text className="text-xs font-semibold text-ui-highlight">
              Mark all read
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="w-10" />
        )}
      </View>
    );
  }

  return (
    <View className="h-16 flex-row items-center bg-ui-light px-4 pt-4">
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={goBack}
        className="h-11 w-11 items-center justify-center rounded-full"
        hitSlop={8}
      >
        <Icon
          name="ArrowLeft"
          size={24}
          color="#111827"
        />
      </TouchableOpacity>
      <Text className="flex-1 px-3 text-2xl font-bold text-ui-dark">
        Notifications
      </Text>
      {showMarkAll && onMarkAll ? (
        <TouchableOpacity
          onPress={onMarkAll}
          accessibilityRole="button"
          accessibilityLabel="Mark all notifications as read"
          className="rounded-full bg-ui-highlight/10 px-3 py-1.5"
        >
          <Text className="text-sm font-semibold text-ui-highlight">
            Mark all read
          </Text>
        </TouchableOpacity>
      ) : (
        <View className="w-11" />
      )}
    </View>
  );
};

const NotificationSkeleton: React.FC = () => (
  <View className="flex-row gap-3 rounded-2xl border border-ui-shade/10 bg-white p-3">
    <Skeleton width={40} height={40} radius={9999} />
    <View className="flex-1 gap-2">
      <Skeleton width="55%" height={14} />
      <Skeleton width="100%" height={12} />
      <Skeleton width="80%" height={12} />
    </View>
  </View>
);

interface EmptyStateProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onRefresh, isRefreshing }) => (
  <ScrollView
    className="flex-1"
    contentContainerClassName="flex-1 items-center justify-center gap-3 px-6 py-12"
    refreshControl={
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        tintColor="#541388"
        colors={["#541388"]}
      />
    }
  >
    <View className="h-16 w-16 items-center justify-center rounded-full bg-ui-shade/5">
      <Text className="text-3xl">{"🔔"}</Text>
    </View>
    <Text className="text-lg font-semibold text-ui-dark">
      You&apos;re all caught up
    </Text>
    <Text className="text-center text-sm text-ui-shade/70">
      New matches, feedback, verification updates, and community activity will
      show up here.
    </Text>
    <Button
      variant="outline"
      text={isRefreshing ? "Refreshing..." : "Refresh"}
      onClick={onRefresh}
      className="rounded-full px-6"
    />
  </ScrollView>
);

export default NotificationsScreen;
