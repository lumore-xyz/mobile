import SurfacePanel from "@/src/components/ui/SurfacePanel";
import { useMutation } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import EarnCreditInformation from "../components/credits/EarnCreditInformation";
import EarnCreditInfoPanel from "../components/credits/EarnCreditInfoPanel";
import EarnCreditQuotaPill from "../components/credits/EarnCreditQuotaPill";
import SubPageBack from "../components/headers/SubPageBack";
import { useAd } from "../hooks/useAd";
import { claimRewardedAdCredit } from "@/src/features/credits/api";
import useCreditsBalance from "@/src/features/credits/useCreditsBalance";
import invalidateCreditsQueries from "@/src/features/credits/invalidateCreditsQueries";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import { queryClient } from "../service/query-client";
import { triggerSelectionHaptic } from "../utils/haptics";

interface EarnCreditsScreenProps {
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const EarnCreditsScreen: React.FC<EarnCreditsScreenProps> = ({
  isRefreshing = false,
  onRefresh,
}) => {
  const { showRewarded, isRewardedLoaded } = useAd();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [pendingClaimId, setPendingClaimId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { data: balanceRes, isLoading: isBalanceLoading } = useCreditsBalance();

  const claimMutation = useMutation({
    mutationFn: (claimId: string) => claimRewardedAdCredit({ claimId }),
    onSuccess: (response) => {
      void invalidateCreditsQueries(queryClient);
      setPendingClaimId(null);

      const result = response?.data;
      if (result?.granted) {
        setStatusMessage("Reward granted: +1 credit added.");
        return;
      }
      if (result?.reason === "HOURLY_LIMIT_REACHED") {
        setStatusMessage("Hourly ad reward limit reached. Try again later.");
        return;
      }
      if (result?.reason === "DUPLICATE_CLAIM") {
        setStatusMessage("This ad reward was already claimed.");
        return;
      }
      setStatusMessage("No credit was granted for this ad attempt.");
    },
    onError: () => {
      setStatusMessage(
        "Network issue while claiming reward. Tap again to retry this claim.",
      );
    },
  });

  const rewardedMax = Number(balanceRes?.data?.rewardedAdsMaxPerHour ?? 3);
  const hasQuotaData = Boolean(balanceRes?.data);
  const rewardedRemaining = Number(
    balanceRes?.data?.rewardedAdsRemainingInWindow ?? rewardedMax,
  );
  const rewardedWatched = Number(
    balanceRes?.data?.rewardedAdsWatchedInWindow ?? 0,
  );
  const rewardedNextEligibleAt =
    balanceRes?.data?.rewardedAdsNextEligibleAt || null;
  const isHourlyCapped = hasQuotaData ? rewardedRemaining <= 0 : false;

  const nextEligibleLabel = useMemo(() => {
    if (!rewardedNextEligibleAt) return null;
    const date = new Date(rewardedNextEligibleAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
  }, [rewardedNextEligibleAt]);

  const handleWatchRewardedAd = async () => {
    if (isWatchingAd || claimMutation.isPending) return;

    if (pendingClaimId) {
      await claimMutation.mutateAsync(pendingClaimId);
      return;
    }

    if (isHourlyCapped) {
      setStatusMessage("Hourly ad reward limit reached. Try again later.");
      return;
    }

    if (!isRewardedLoaded) {
      setStatusMessage("Ad is still loading. Please try again in a moment.");
      return;
    }

    setStatusMessage(null);
    setIsWatchingAd(true);

    try {
      const reward = await showRewarded();
      if (!reward) {
        setStatusMessage("Ad was not fully completed. No credit awarded.");
        return;
      }

      const claimId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      setPendingClaimId(claimId);
      await claimMutation.mutateAsync(claimId);
    } catch {
      setStatusMessage("Unable to complete rewarded ad flow right now.");
    } finally {
      setIsWatchingAd(false);
    }
  };

  const isWatchDisabled =
    isBalanceLoading ||
    isWatchingAd ||
    claimMutation.isPending ||
    (!pendingClaimId && (!isRewardedLoaded || isHourlyCapped));

  const watchButtonText = pendingClaimId
    ? "Retry credit claim (+1)"
    : isWatchingAd
      ? "Watching ad..."
      : claimMutation.isPending
        ? "Claiming reward..."
        : isHourlyCapped
          ? "Hourly limit reached"
          : "Watch rewarded ad (+1)";

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Earn Credits" />
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
                Rewards
              </Text>
              <Text
                className="mt-1 font-display text-[32px] leading-9 text-ui-paper"
                accessibilityRole="header"
              >
                Earn credits for showing up
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-paper/70">
                Credits power premium moments on Lumore. Earn them through
                activity, referrals, approved contributions, and rewarded ads.
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="Sparkles" size={24} color={COLORS.ink} />
            </View>
          </View>
        </SurfacePanel>

        <SurfacePanel surface="paper" className="mt-5">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest/10">
              <Icon name="Video" size={19} color={COLORS.forest} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-ink">
                Watch ad for credits
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                Earn +1 credit per successful rewarded ad completion.
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <EarnCreditQuotaPill
              icon="Gauge"
              label="Hourly quota"
              value={`${rewardedWatched}/${rewardedMax} used`}
            />
            <EarnCreditQuotaPill
              icon="Clock3"
              label="Remaining"
              value={`${Math.max(rewardedRemaining, 0)}`}
            />
          </View>

          {isHourlyCapped && nextEligibleLabel ? (
            <EarnCreditInfoPanel
              tone="warning"
              text={`Next ad reward window opens at ${nextEligibleLabel}.`}
            />
          ) : null}
          {!isRewardedLoaded ? (
            <EarnCreditInfoPanel tone="muted" text="Rewarded ad is loading..." />
          ) : null}
          {statusMessage ? (
            <EarnCreditInfoPanel tone="highlight" text={statusMessage} />
          ) : null}

          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              void handleWatchRewardedAd();
            }}
            disabled={isWatchDisabled}
            className={`mt-4 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-4 ${
              isWatchDisabled ? "opacity-60" : "active:opacity-80"
            }`}
            accessibilityRole="button"
            accessibilityLabel={watchButtonText}
            accessibilityState={{ disabled: isWatchDisabled }}
          >
            <Icon name="PlayCircle" size={18} color={COLORS.paper} />
            <Text className="font-semibold text-ui-paper">
              {watchButtonText}
            </Text>
          </Pressable>
        </SurfacePanel>

        <EarnCreditInformation />
      </ScrollView>
    </View>
  );
};

export default EarnCreditsScreen;
