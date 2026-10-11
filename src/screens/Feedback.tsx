import FeedbackCard from "@/src/components/feedback/FeedbackCard";
import FeedbackListHeader from "@/src/components/feedback/FeedbackListHeader";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  View,
} from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import { fetchReceivedFeedbacksPage } from "@/src/features/feedback/api";
import { feedbackQueryKeys } from "@/src/features/feedback/queryKeys";
import { COLORS } from "../libs/constants/theme";
import { FeedbackItem } from "../utils/types";

interface FeedbackScreenProps {
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const keyExtractor = (item: FeedbackItem) => item._id;

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  isRefreshing = false,
  onRefresh,
}) => {
  const query = useInfiniteQuery({
    queryKey: feedbackQueryKeys.received,
    queryFn: ({ pageParam }) => fetchReceivedFeedbacksPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );
  const ratings = items.flatMap((item) =>
    typeof item.rating === "number" ? [item.rating] : [],
  );
  const averageRating = ratings.length
    ? ratings.reduce((total, rating) => total + rating, 0) / ratings.length
    : null;
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const renderItem = useCallback<ListRenderItem<FeedbackItem>>(
    ({ item }) => <FeedbackCard item={item} />,
    [],
  );

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Feedback" />
      <FlatList
        className="flex-1"
        contentContainerClassName="px-4 pb-10"
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          onRefresh ? (
            <LumoreRefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          ) : undefined
        }
        ListHeaderComponent={
          <FeedbackListHeader
            averageRating={averageRating}
            ratingCount={ratings.length}
            isLoading={query.isLoading}
            isError={query.isError}
            isEmpty={query.isSuccess && items.length === 0}
            onRetry={() => void query.refetch()}
          />
        }
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <View className="items-center py-5">
              <ActivityIndicator color={COLORS.forest} />
            </View>
          ) : query.hasNextPage ? (
            <View className="h-4" />
          ) : null
        }
      />
    </View>
  );
};

export default FeedbackScreen;
