import SurfacePanel from "@/src/components/ui/SurfacePanel";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import CreditHistoryCard from "@/src/components/credits/CreditHistoryCard";
import CreditHistorySkeleton from "@/src/components/credits/CreditHistorySkeleton";
import CreditMiniStat from "@/src/components/credits/CreditMiniStat";
import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import {
  claimDailyCredits,
  fetchCreditsHistory,
} from "@/src/features/credits/api";
import useCreditsBalance from "@/src/features/credits/useCreditsBalance";
import invalidateCreditsQueries from "@/src/features/credits/invalidateCreditsQueries";
import { creditsQueryKeys } from "@/src/features/credits/queryKeys";
import { queryClient } from "../service/query-client";
import { triggerSelectionHaptic } from "../utils/haptics";
import { CreditHistoryItem } from "../utils/types";

interface CreditsScreenProps {
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const CreditsScreen: React.FC<CreditsScreenProps> = ({
  isRefreshing = false,
  onRefresh,
}) => {
  const [page, setPage] = useState(1);

  const { data: balanceRes, isLoading: isBalanceLoading } = useCreditsBalance();

  const { data: historyRes, isLoading: isHistoryLoading } = useQuery({
    queryKey: creditsQueryKeys.historyPage(page),
    queryFn: () => fetchCreditsHistory({ page, limit: 20 }),
  });

  const claimMutation = useMutation({
    mutationFn: claimDailyCredits,
    onSuccess: () => {
      void invalidateCreditsQueries(queryClient);
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
            <LumoreRefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
            />
          ) : undefined
        }
      >
        <SurfacePanel surface="midnight" className="overflow-hidden">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ui-paper/60">
                Available credits
              </Text>
              {isBalanceLoading ? (
                <View className="mt-3">
                  <Skeleton width={108} height={42} />
                </View>
              ) : (
                <Text
                  className="mt-2 text-[44px] font-semibold leading-[50px] text-ui-paper"
                  accessibilityRole="header"
                >
                  {balance}
                </Text>
              )}
              <Text className="mt-2 text-sm leading-5 text-ui-paper/70">
                Use credits for premium match moments, unlocks, and Lumore
                features.
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="WalletCards" size={24} color={COLORS.ink} />
            </View>
          </View>

          <View className="mt-5 rounded-[24px] bg-ui-paper/10 p-3">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-champagne/20">
                <Icon name="Sparkles" size={18} color={COLORS.champagne} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-ui-paper">
                  Daily reward
                </Text>
                <Text className="mt-0.5 text-sm text-ui-paper/65">
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
              className={`min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-4 ${
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
              <Icon name="BadgePlus" size={18} color={COLORS.paper} />
              <Text className="font-semibold text-ui-paper">
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
              className="min-h-12 flex-row items-center justify-center gap-2 rounded-full border border-ui-paper/25 px-4 active:bg-ui-paper/10"
              accessibilityRole="button"
              accessibilityLabel="Earn more credits"
            >
              <Icon name="Gift" size={18} color={COLORS.paper} />
              <Text className="font-semibold text-ui-paper">Earn credits</Text>
            </Pressable>
          </View>
        </SurfacePanel>

        <View className="mt-5 flex-row gap-3">
          <CreditMiniStat
            icon="CalendarCheck"
            label="Daily"
            value={
              rewardGrantedToday ? "Claimed" : `+${dailyRewardAmount} ready`
            }
          />
          <CreditMiniStat icon="History" label="Ledger" value={`${items.length} shown`} />
        </View>

        <View className="mt-5 rounded-[24px] border border-ui-parchment bg-ui-surface-page p-4">
          <View className="mb-1 flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
              <Icon name="ReceiptText" size={18} color={COLORS.forest} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-ink">
                Credit history
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                Track every credit you earn or spend.
              </Text>
            </View>
          </View>

          <View className="mt-3">
            {isHistoryLoading || isBalanceLoading ? (
              <CreditHistorySkeleton />
            ) : null}
            {!isHistoryLoading && !isBalanceLoading && items.length === 0 ? (
              <View className="rounded-[24px] bg-ui-paper p-5">
                <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-ui-forest/10">
                  <Icon name="WalletCards" size={20} color={COLORS.forest} />
                </View>
                <Text className="text-base font-bold text-ui-ink">
                  No credit activity yet
                </Text>
                <Text className="mt-1 text-sm leading-5 text-ui-slate">
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
            <View className="min-h-11 items-center justify-center rounded-full bg-ui-paper px-4">
              <Text className="text-sm font-semibold text-ui-slate">
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

export default CreditsScreen;
