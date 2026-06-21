import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import {
  deleteNotification,
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../libs/notifications/api";
import type { NotificationItem } from "../libs/notifications/constants";
import {
  NOTIFICATION_QUERY_KEYS,
  clampPageSize,
  getCurrentUserId,
} from "../libs/notifications/queries";
import { useNotificationSocketSync } from "../libs/notifications/sync";

export { NOTIFICATION_QUERY_KEYS, useNotificationSocketSync };

interface UseNotificationsOptions {
  pageSize?: number;
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const limit = clampPageSize(options.pageSize);
  const userId = getCurrentUserId();

  const query = useInfiniteQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.infinite(userId, limit),
    queryFn: async ({ pageParam = 1 }) =>
      fetchNotifications({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination?.hasMore) return undefined;
      return (lastPage.pagination.page || 1) + 1;
    },
    enabled: Boolean(userId),
  });

  const items = useMemo<NotificationItem[]>(() => {
    if (!query.data?.pages) return [];
    const all: NotificationItem[] = [];
    for (const page of query.data.pages) {
      if (page?.data?.length) {
        all.push(...page.data);
      }
    }
    return all;
  }, [query.data]);

  const unreadCountFromList = useMemo(() => {
    const last = query.data?.pages?.[query.data.pages.length - 1];
    return Number(last?.unreadCount || 0);
  }, [query.data]);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  return {
    items,
    unreadCount: unreadCountFromList,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingMore: query.isFetchingNextPage,
    hasMore: Boolean(query.hasNextPage),
    error: query.error,
    refetch: query.refetch,
    loadMore,
  };
};

export const useNotificationUnreadCount = () => {
  const userId = getCurrentUserId();
  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount(userId),
    queryFn: fetchUnreadNotificationCount,
    enabled: Boolean(userId),
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.root,
      });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.root,
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: NOTIFICATION_QUERY_KEYS.root,
      });
    },
  });
};

export const notificationHelpers = {
  isUnread: (notification: NotificationItem) => !notification.isRead,
};
