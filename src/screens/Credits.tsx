import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import {
  claimDailyCredits,
  fetchCreditsBalance,
  fetchCreditsHistory,
} from "../libs/apis";
import { queryClient } from "../service/query-client";
import { CreditHistoryItem } from "../utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";

const TYPE_LABELS: Record<string, string> = {
  signup_bonus: "Signup bonus",
  daily_active: "Daily active reward",
  conversation_start: "Conversation start",
  this_or_that_approved: "This-or-That approved",
  referral_bonus: "Referral bonus",
  rewarded_ad_watch: "Rewarded ad watch",
  admin_adjustment: "Admin adjustment",
};

const CreditsScreen = () => {
  const [page, setPage] = useState(1);

  const { data: balanceRes, isLoading: isBalanceLoading } = useQuery({
    queryKey: ["credits", "balance"],
    queryFn: fetchCreditsBalance,
  });

  const { data: historyRes, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["credits", "history", page],
    queryFn: () => fetchCreditsHistory({ page, limit: 20 }),
  });

  const claimMutation = useMutation({
    mutationFn: claimDailyCredits,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["credits", "history"] });
    },
  });

  const balance = balanceRes?.data?.credits ?? 0;
  const rewardGrantedToday = Boolean(balanceRes?.data?.rewardGrantedToday);
  const dailyRewardAmount = Number(balanceRes?.data?.dailyRewardAmount || 1);
  const items: CreditHistoryItem[] = historyRes?.items || [];
  const pagination = historyRes?.pagination;

  return (
    <View className="flex-1 bg-ui-light">
      <SubPageBack title="Credits" />
      <ScrollView className="p-4" contentContainerClassName="pb-10">
        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-sm text-ui-shade/70">Available credits</Text>
          <View className="flex-row items-center justify-between mt-2">
            {isBalanceLoading ? (
              <Skeleton width={108} height={36} />
            ) : (
              <Text className="text-3xl font-bold text-ui-shade">{balance}</Text>
            )}
          </View>
          <View className="mt-4 gap-2">
            <Button
              disabled={
                isBalanceLoading || rewardGrantedToday || claimMutation.isPending
              }
              text={
                isBalanceLoading
                  ? "Checking daily reward..."
                  : rewardGrantedToday
                  ? "Daily reward already claimed"
                  : `Claim daily +${dailyRewardAmount}`
              }
              onClick={() => claimMutation.mutate()}
            />
            <Button
              variant="outline"
              text="Earn credits"
              onClick={() => router.push("/(subpage)/earn-credits")}
            />
          </View>
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4 mt-4">
          <Text className="text-lg font-semibold">Credit history</Text>
          <View className="mt-3">
            {isHistoryLoading || isBalanceLoading ? (
              <CreditHistoryListSkeleton />
            ) : null}
            {!isHistoryLoading && !isBalanceLoading && items.length === 0 ? (
              <Text className="text-sm text-ui-shade/70">
                No credit activity yet.
              </Text>
            ) : null}

            {!isHistoryLoading && !isBalanceLoading
              ? items.map((item) => (
              <View
                key={item._id}
                className="mt-3 flex-row items-center justify-between border border-ui-shade/10 rounded-lg p-3"
              >
                <View>
                  <Text className="font-medium text-ui-shade">
                    {TYPE_LABELS[item.type] || item.type}
                  </Text>
                  <Text className="text-xs text-ui-shade/60 mt-1">
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    className={
                      item.amount >= 0 ? "text-green-600" : "text-red-600"
                    }
                  >
                    {item.amount >= 0 ? `+${item.amount}` : item.amount}
                  </Text>
                  <Text className="text-xs text-ui-shade/60 mt-1">
                    Balance: {item.balanceAfter}
                  </Text>
                </View>
              </View>
                ))
              : null}
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Button
              variant="outline"
              text="Previous"
              disabled={!pagination || page <= 1}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            />
            <Text className="text-sm text-ui-shade/70">
              Page {pagination?.page || 1}
            </Text>
            <Button
              variant="outline"
              text="Next"
              disabled={!pagination?.hasMore}
              onClick={() => setPage((prev) => prev + 1)}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const CreditHistoryListSkeleton = () => (
  <View className="gap-3">
    {Array.from({ length: 4 }).map((_, index) => (
      <View
        key={`credit-history-skeleton-${index}`}
        className="flex-row items-center justify-between border border-ui-shade/10 rounded-lg p-3"
      >
        <View className="flex-1 pr-4">
          <Skeleton width="58%" height={13} />
          <Skeleton width="44%" height={11} style={{ marginTop: 8 }} />
        </View>
        <View className="items-end">
          <Skeleton width={46} height={13} />
          <Skeleton width={66} height={11} style={{ marginTop: 8 }} />
        </View>
      </View>
    ))}
  </View>
);

export default CreditsScreen;
