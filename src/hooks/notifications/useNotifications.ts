import {
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { fetchNotifications } from "@/src/libs/notifications/api";
import type { NotificationItem } from "@/src/libs/notifications/constants";
import {
  NOTIFICATION_QUERY_KEYS,
  clampPageSize,
  getCurrentUserId,
} from "@/src/libs/notifications/queries";

interface UseNotificationsOptions {
  pageSize?: number;
}

export default function useNotifications(options: UseNotificationsOptions = {}) {
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
      if (page?.data?.length) all.push(...page.data);
    }
    return all;
  }, [query.data]);

  const unreadCount = useMemo(() => {
    const last = query.data?.pages?.[query.data.pages.length - 1];
    return Number(last?.unreadCount || 0);
  }, [query.data]);

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return {
    items,
    unreadCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingMore: isFetchingNextPage,
    hasMore: Boolean(hasNextPage),
    error: query.error,
    refetch: query.refetch,
    loadMore,
  };
}
