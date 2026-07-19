import { useQuery } from "@tanstack/react-query";
import React from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { fetchReceivedFeedbacks } from "../libs/apis";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import { FeedbackItem } from "../utils/types";

interface FeedbackScreenProps {
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  isRefreshing = false,
  onRefresh,
}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["feedback", "received"],
    queryFn: fetchReceivedFeedbacks,
  });

  const items: FeedbackItem[] = data || [];
  const ratedItems = items.filter((item) => typeof item.rating === "number");
  const averageRating = ratedItems.length
    ? ratedItems.reduce((total, item) => total + Number(item.rating), 0) /
      ratedItems.length
    : null;

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Feedback" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-3"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.highlight}
              colors={[COLORS.highlight]}
            />
          ) : undefined
        }
      >
        <View className="mb-5 overflow-hidden rounded-[28px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-ui-light" accessibilityRole="header">
                What people felt
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-light/70">
                Private reflections shared after your conversations.
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="MessageCircleHeart" size={20} color={COLORS.shade} />
            </View>
          </View>
          {averageRating !== null ? (
            <View className="mt-5 flex-row items-end gap-2">
              <Text className="text-3xl font-bold text-ui-light">
                {averageRating.toFixed(1)}
              </Text>
              <Text className="pb-1 text-sm text-ui-light/70">
                average from {ratedItems.length} {ratedItems.length === 1 ? "rating" : "ratings"}
              </Text>
            </View>
          ) : null}
        </View>

        {isLoading ? (
          <View className="gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <FeedbackSkeletonCard key={index} />
            ))}
          </View>
        ) : null}

        {isError ? (
          <View className="items-center rounded-[28px] border border-ui-border bg-ui-light px-6 py-8" accessibilityLiveRegion="polite">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <Icon name="CloudOff" size={24} color={COLORS.danger} />
            </View>
            <Text className="mt-4 text-center text-xl font-bold text-ui-shade">
              Feedback is taking a moment
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-ui-muted">
              We could not load your feedback. Check your connection and try again.
            </Text>
            <Button text="Try again" onClick={() => void refetch()} className="mt-5 px-6" />
          </View>
        ) : null}

        {!isLoading && !isError && (!items || items.length === 0) ? (
          <View className="items-center rounded-[28px] border border-ui-border bg-ui-light px-6 py-8">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-highlight/10">
              <Icon name="MessageCircleMore" size={24} color={COLORS.highlight} />
            </View>
            <Text className="mt-4 text-center text-xl font-bold text-ui-shade">
              Nothing shared yet
            </Text>
            <Text className="mt-2 text-center text-sm leading-5 text-ui-muted">
              Feedback appears here after someone reflects on a conversation with you.
            </Text>
          </View>
        ) : null}

        {!isLoading && !isError && items?.length ? (
          <View className="gap-3">
            {items.map((item) => (
              <View
                key={item._id}
                className="rounded-[24px] border border-ui-border bg-ui-light p-4"
              >
                <View className="mb-3 flex-row items-start justify-between gap-3">
                  <View className="min-w-0 flex-1 flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-ui-highlight/10">
                      <Text className="font-bold text-ui-highlight">
                        {(item.user?.nickname || item.user?.username || "A").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  <Text className="min-w-0 flex-1 text-base font-bold text-ui-shade" numberOfLines={1}>
                    {item.user?.nickname || item.user?.username || "Anonymous"}
                  </Text>
                  </View>
                  <Text className="text-xs font-medium text-ui-muted">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                {typeof item.rating === "number" ? (
                  <View className="mb-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-semibold text-ui-muted">Conversation rating</Text>
                      <View className="flex-row items-center gap-1 rounded-full bg-ui-primary/20 px-2.5 py-1">
                        <Icon name="Star" size={13} color={COLORS.foreground} />
                        <Text className="text-xs font-bold text-ui-foreground">{item.rating}/10</Text>
                      </View>
                    </View>
                    <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-ui-shade/10">
                      <View
                        className="h-1.5 rounded-full bg-ui-highlight"
                        style={{ width: `${Math.max(0, Math.min(10, item.rating)) * 10}%` }}
                      />
                    </View>
                  </View>
                ) : null}

                {item.reason ? (
                  <Text className="mb-1 text-xs font-semibold text-ui-highlight">{item.reason}</Text>
                ) : null}
                <Text className="text-sm leading-6 text-ui-shade">
                  {item.feedback || "No written feedback was provided."}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

const FeedbackSkeletonCard = () => (
  <View className="rounded-[24px] border border-ui-border bg-ui-light p-4">
    <View className="flex-row items-center justify-between gap-2">
      <Skeleton width="38%" height={12} />
      <Skeleton width={76} height={10} />
    </View>
    <Skeleton width={64} height={10} style={{ marginTop: 10 }} />
    <Skeleton width="100%" height={12} style={{ marginTop: 10 }} />
    <Skeleton width="76%" height={12} style={{ marginTop: 8 }} />
  </View>
);

export default FeedbackScreen;
