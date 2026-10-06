import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  Text,
  View,
} from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { fetchReceivedFeedbacksPage } from "../libs/apis";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
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
    queryKey: ["feedback", "received"],
    queryFn: ({ pageParam }) => fetchReceivedFeedbacksPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasMore ? lastPage.pagination.page + 1 : undefined,
  });

  const items: FeedbackItem[] = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) || [],
    [query.data],
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = query;
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
  const ratedItems = items.filter((item) => typeof item.rating === "number");
  const averageRating = ratedItems.length
    ? ratedItems.reduce((total, item) => total + Number(item.rating), 0) /
      ratedItems.length
    : null;
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
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.forest}
              colors={[COLORS.forest]}
            />
          ) : undefined
        }
        ListHeaderComponent={
          <View className="pb-5 pt-3">
            <View className="mb-5 overflow-hidden rounded-[24px] bg-ui-midnight p-5">
              <View className="flex-row items-start justify-between gap-4">
                <View className="flex-1">
                  <Text
                    className="text-2xl font-bold text-ui-paper"
                    accessibilityRole="header"
                  >
                    What people felt
                  </Text>
                  <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
                    Private reflections shared after your conversations.
                  </Text>
                </View>
                <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-champagne">
                  <Icon
                    name="MessageCircleHeart"
                    size={20}
                    color={COLORS.ink}
                  />
                </View>
              </View>
              {averageRating !== null ? (
                <View className="mt-5 flex-row items-end gap-2">
                  <Text className="text-3xl font-bold text-ui-paper">
                    {averageRating.toFixed(1)}
                  </Text>
                  <Text className="pb-1 text-sm text-ui-paper/70">
                    average from {ratedItems.length}{" "}
                    {ratedItems.length === 1 ? "rating" : "ratings"}
                  </Text>
                </View>
              ) : null}
            </View>

            {query.isLoading ? (
              <View className="gap-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <FeedbackSkeletonCard key={index} />
                ))}
              </View>
            ) : null}

            {query.isError ? (
              <View
                className="items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8"
                accessibilityLiveRegion="polite"
              >
                <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-danger/10">
                  <Icon name="CloudOff" size={24} color={COLORS.danger} />
                </View>
                <Text className="mt-4 text-center text-xl font-bold text-ui-ink">
                  Feedback is taking a moment
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
                  We could not load your feedback. Check your connection and
                  try again.
                </Text>
                <Button
                  text="Try again"
                  onClick={() => void query.refetch()}
                  className="mt-5 px-6"
                />
              </View>
            ) : null}

            {!query.isLoading && !query.isError && items.length === 0 ? (
              <View className="items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
                  <Icon
                    name="MessageCircleMore"
                    size={24}
                    color={COLORS.forest}
                  />
                </View>
                <Text className="mt-4 text-center text-xl font-bold text-ui-ink">
                  Nothing shared yet
                </Text>
                <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
                  Feedback appears here after someone reflects on a conversation
                  with you.
                </Text>
              </View>
            ) : null}

          </View>
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

const FeedbackSkeletonCard = () => (
  <View className="rounded-[24px] border border-ui-parchment bg-ui-paper p-4">
    <View className="flex-row items-center justify-between gap-2">
      <Skeleton width="38%" height={12} />
      <Skeleton width={76} height={10} />
    </View>
    <Skeleton width={64} height={10} style={{ marginTop: 10 }} />
    <Skeleton width="100%" height={12} style={{ marginTop: 10 }} />
    <Skeleton width="76%" height={12} style={{ marginTop: 8 }} />
  </View>
);

const FeedbackCard = ({ item }: { item: FeedbackItem }) => {
  const name = item.user?.nickname || item.user?.username || "Anonymous";

  return (
    <View className="mb-3 rounded-[24px] border border-ui-parchment bg-ui-paper p-4">
      <View className="mb-3 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-ui-forest/10">
            <Text className="font-bold text-ui-forest">
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text
            className="min-w-0 flex-1 text-base font-bold text-ui-ink"
            numberOfLines={1}
          >
            {name}
          </Text>
        </View>
        <Text className="text-xs font-medium text-ui-slate">
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {typeof item.rating === "number" ? (
        <View className="mb-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-semibold text-ui-slate">
              Conversation rating
            </Text>
            <View className="flex-row items-center gap-1 rounded-full bg-ui-champagne/20 px-2.5 py-1">
              <Icon name="Star" size={13} color={COLORS.midnight} />
              <Text className="text-xs font-bold text-ui-midnight">
                {item.rating}/10
              </Text>
            </View>
          </View>
          <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-ui-ink/10">
            <View
              className="h-1.5 rounded-full bg-ui-forest"
              style={{ width: `${Math.max(0, Math.min(10, item.rating)) * 10}%` }}
            />
          </View>
        </View>
      ) : null}

      {item.reason ? (
        <Text className="mb-1 text-xs font-semibold text-ui-forest">
          {item.reason}
        </Text>
      ) : null}
      <Text className="text-sm leading-6 text-ui-ink">
        {item.feedback || "No written feedback was provided."}
      </Text>
    </View>
  );
};

export default FeedbackScreen;
