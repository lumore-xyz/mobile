import SurfacePanel from "@/src/components/ui/SurfacePanel";
import Button from "@/src/components/ui/Button";
import FeedbackSkeletonCard from "@/src/components/feedback/FeedbackSkeletonCard";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";

const FeedbackListHeader = ({
  averageRating,
  ratingCount,
  isLoading,
  isError,
  isEmpty,
  onRetry,
}: {
  averageRating: number | null;
  ratingCount: number;
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  onRetry: () => void;
}) => (
  <View className="pb-5 pt-3">
    <SurfacePanel surface="midnight" className="mb-5 overflow-hidden">
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
          <Icon name="MessageCircleHeart" size={20} color={COLORS.ink} />
        </View>
      </View>
      {averageRating !== null ? (
        <View className="mt-5 flex-row items-end gap-2">
          <Text className="text-3xl font-bold text-ui-paper">
            {averageRating.toFixed(1)}
          </Text>
          <Text className="pb-1 text-sm text-ui-paper/70">
            average from {ratingCount} {ratingCount === 1 ? "rating" : "ratings"}
          </Text>
        </View>
      ) : null}
    </SurfacePanel>

    {isLoading ? (
      <View className="gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <FeedbackSkeletonCard key={`feedback-skeleton-${index}`} />
        ))}
      </View>
    ) : null}

    {isError ? (
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
          We could not load your feedback. Check your connection and try again.
        </Text>
        <Button text="Try again" onClick={onRetry} className="mt-5 px-6" />
      </View>
    ) : null}

    {isEmpty ? (
      <View className="items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
          <Icon name="MessageCircleMore" size={24} color={COLORS.forest} />
        </View>
        <Text className="mt-4 text-center text-xl font-bold text-ui-ink">
          Nothing shared yet
        </Text>
        <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
          Feedback appears here after someone reflects on a conversation with you.
        </Text>
      </View>
    ) : null}
  </View>
);

export default FeedbackListHeader;
