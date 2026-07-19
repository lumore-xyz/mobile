import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import {
  claimDailyCredits,
  fetchCreditsBalance,
  fetchCreditsHistory,
} from "../libs/apis";
import { queryClient } from "../service/query-client";
import { triggerSelectionHaptic } from "../utils/haptics";
import { CreditHistoryItem } from "../utils/types";

interface CreditsScreenProps {
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  signup_bonus: "Signup bonus",
  daily_active: "Daily active reward",
  conversation_start: "Conversation start",
  this_or_that_approved: "This-or-That approved",
  referral_bonus: "Referral bonus",
  rewarded_ad_watch: "Rewarded ad watch",
  admin_adjustment: "Admin adjustment",
};

const CreditsScreen: React.FC<CreditsScreenProps> = ({
  isRefreshing = false,
  onRefresh,
}) => {
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
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Credits" />
      <ScrollView
        className="px-4"
        contentContainerClassName="pb-10 pt-4"
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
        <View className="overflow-hidden rounded-[32px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ui-light/60">
                Available credits
              </Text>
              {isBalanceLoading ? (
                <View className="mt-3">
                  <Skeleton width={108} height={42} />
                </View>
              ) : (
                <Text
                  className="mt-2 text-[44px] font-black leading-[50px] text-ui-light"
                  accessibilityRole="header"
                >
                  {balance}
                </Text>
              )}
              <Text className="mt-2 text-sm leading-5 text-ui-light/70">
                Use credits for premium match moments, unlocks, and Lumore
                features.
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="WalletCards" size={24} color={COLORS.shade} />
            </View>
          </View>

          <View className="mt-5 rounded-[24px] bg-ui-light/10 p-3">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-primary/20">
                <Icon name="Sparkles" size={18} color={COLORS.primary} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-ui-light">
                  Daily reward
                </Text>
                <Text className="mt-0.5 text-sm text-ui-light/65">
                  {rewardGrantedToday
                    ? "You already claimed today's reward."
                    : `Claim +${dailyRewardAmount} credit${dailyRewardAmount === 1 ? "" : "s"} today.`}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 gap-3">
            <Pressable
              disabled={
                isBalanceLoading ||
                rewardGrantedToday ||
                claimMutation.isPending
              }
              onPress={() => {
                triggerSelectionHaptic();
                claimMutation.mutate();
              }}
              className={`min-h-12 flex-row items-center justify-center gap-2 rounded-full bg-ui-primary px-4 ${
                isBalanceLoading || rewardGrantedToday || claimMutation.isPending
                  ? "opacity-60"
                  : "active:opacity-80"
              }`}
              accessibilityRole="button"
              accessibilityLabel="Claim daily credits"
              accessibilityState={{
                disabled:
                  isBalanceLoading ||
                  rewardGrantedToday ||
                  claimMutation.isPending,
              }}
            >
              <Icon name="BadgePlus" size={18} color={COLORS.shade} />
              <Text className="font-bold text-ui-shade">
                {isBalanceLoading
                  ? "Checking daily reward..."
                  : rewardGrantedToday
                    ? "Daily reward claimed"
                    : claimMutation.isPending
                      ? "Claiming..."
                      : `Claim daily +${dailyRewardAmount}`}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                triggerSelectionHaptic();
                router.push("/(subpage)/earn-credits");
              }}
              className="min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-ui-light/25 px-4 active:bg-ui-light/10"
              accessibilityRole="button"
              accessibilityLabel="Earn more credits"
            >
              <Icon name="Gift" size={18} color={COLORS.light} />
              <Text className="font-semibold text-ui-light">Earn credits</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-5 flex-row gap-3">
          <MiniStat
            icon="CalendarCheck"
            label="Daily"
            value={
              rewardGrantedToday ? "Claimed" : `+${dailyRewardAmount} ready`
            }
          />
          <MiniStat icon="History" label="Ledger" value={`${items.length} shown`} />
        </View>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-surface-page p-4">
          <View className="mb-1 flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-highlight/10">
              <Icon name="ReceiptText" size={18} color={COLORS.highlight} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-shade">
                Credit history
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">
                Track every credit you earn or spend.
              </Text>
            </View>
          </View>

          <View className="mt-3">
            {isHistoryLoading || isBalanceLoading ? (
              <CreditHistoryListSkeleton />
            ) : null}
            {!isHistoryLoading && !isBalanceLoading && items.length === 0 ? (
              <View className="rounded-[24px] bg-ui-light p-5">
                <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-ui-highlight/10">
                  <Icon name="WalletCards" size={20} color={COLORS.highlight} />
                </View>
                <Text className="text-base font-bold text-ui-shade">
                  No credit activity yet
                </Text>
                <Text className="mt-1 text-sm leading-5 text-ui-muted">
                  Claim your daily reward or earn credits to start your ledger.
                </Text>
              </View>
            ) : null}

            {!isHistoryLoading && !isBalanceLoading
              ? items.map((item) => <CreditHistoryCard key={item._id} item={item} />)
              : null}
          </View>

          <View className="mt-4 flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              text="Previous"
              disabled={
                !pagination || page <= 1
              }
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            />
            <View className="min-h-11 items-center justify-center rounded-full bg-ui-light px-4">
              <Text className="text-sm font-semibold text-ui-muted">
                Page {pagination?.page || 1}
              </Text>
            </View>
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

const MiniStat = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View className="flex-1 rounded-[24px] border border-ui-border bg-ui-light p-4">
    <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-ui-highlight/10">
      <Icon name={icon} size={18} color={COLORS.highlight} />
    </View>
    <Text className="text-sm font-semibold text-ui-muted">{label}</Text>
    <Text className="mt-1 text-base font-bold text-ui-shade">{value}</Text>
  </View>
);

const CreditHistoryCard = ({ item }: { item: CreditHistoryItem }) => {
  const isCredit = item.amount >= 0;
  return (
    <View className="mt-3 flex-row items-center justify-between gap-3 rounded-[22px] bg-ui-light p-4">
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className={`h-11 w-11 items-center justify-center rounded-full ${
            isCredit ? "bg-ui-highlight/10" : "bg-red-100"
          }`}
        >
          <Icon
            name={isCredit ? "ArrowDownToLine" : "ArrowUpFromLine"}
            size={18}
            color={isCredit ? COLORS.highlight : COLORS.danger}
          />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-ui-shade">
            {TYPE_LABELS[item.type] || item.type}
          </Text>
          <Text className="mt-1 text-xs leading-4 text-ui-muted">
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text
          className={`text-base font-bold ${
            isCredit ? "text-ui-highlight" : "text-red-600"
          }`}
        >
          {isCredit ? `+${item.amount}` : item.amount}
        </Text>
        <Text className="mt-1 text-xs text-ui-muted">
          Balance {item.balanceAfter}
        </Text>
      </View>
    </View>
  );
};

const CreditHistoryListSkeleton = () => (
  <View className="gap-3">
    {Array.from({ length: 4 }).map((_, index) => (
      <View
        key={`credit-history-skeleton-${index}`}
        className="flex-row items-center justify-between rounded-[22px] bg-ui-light p-4"
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
