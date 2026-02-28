import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import { useAd } from "../hooks/useAd";
import { claimRewardedAdCredit, fetchCreditsBalance } from "../libs/apis";
import Icon from "../libs/Icon";
import { queryClient } from "../service/query-client";

const earnWays = [
  {
    title: "Rewarded ad watch",
    amount: "+1 (max 3/hour)",
    description:
      "Watch a rewarded ad and earn +1 credit. Up to 3 successful ad rewards are granted per rolling hour.",
  },
  {
    title: "Daily activity",
    amount: "+1 / +3",
    description:
      "Claim once per UTC day. Unverified users get +1, verified users get +3.",
  },
  {
    title: "Signup bonus",
    amount: "+10",
    description: "Granted once for new users.",
  },
  {
    title: "This-or-That approvals",
    amount: "+5",
    description:
      "Awarded when your submitted question is approved. Each question is rewarded once.",
  },
  {
    title: "Referral rewards",
    amount: "+10",
    description:
      "Given to the referrer when the referred user gets verified. Referrer must also be verified.",
  },
];

const creditUses = [
  "Use credits to unlock and power premium in-app actions.",
  "Credits support matchmaking and conversation-related actions.",
  "Credits can be used in future Lumore features and game mechanics.",
];

const EarnCreditsScreen = () => {
  const { showRewarded, isRewardedLoaded } = useAd();
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [pendingClaimId, setPendingClaimId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const { data: balanceRes, isLoading: isBalanceLoading } = useQuery({
    queryKey: ["credits", "balance"],
    queryFn: fetchCreditsBalance,
  });

  const claimMutation = useMutation({
    mutationFn: (claimId: string) => claimRewardedAdCredit({ claimId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["credits", "history"] });
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
    <View className="flex-1 bg-ui-light">
      <SubPageBack title="Earn Credits" />
      <ScrollView className="p-4" contentContainerClassName="pb-10 gap-4">
        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <View className="flex-row items-center gap-2">
            <Icon name="videocam-outline" type="Ionicons" size={16} />
            <Text className="text-lg font-semibold">Watch ad for credits</Text>
          </View>
          <Text className="mt-2 text-sm text-ui-shade/70">
            Earn +1 credit per successful rewarded ad completion.
          </Text>
          <Text className="mt-1 text-sm text-ui-shade/70">
            Hourly quota: {rewardedWatched}/{rewardedMax} used
          </Text>
          <Text className="mt-1 text-sm text-ui-shade/70">
            Remaining this hour: {Math.max(rewardedRemaining, 0)}
          </Text>
          {isHourlyCapped && nextEligibleLabel ? (
            <Text className="mt-1 text-xs text-ui-shade/60">
              Next ad reward window opens at {nextEligibleLabel}
            </Text>
          ) : null}
          {!isRewardedLoaded ? (
            <Text className="mt-1 text-xs text-ui-shade/60">
              Rewarded ad is loading...
            </Text>
          ) : null}
          {statusMessage ? (
            <Text className="mt-2 text-sm text-ui-highlight">{statusMessage}</Text>
          ) : null}
          <View className="mt-3">
            <Button
              text={watchButtonText}
              onClick={handleWatchRewardedAd}
              disabled={isWatchDisabled}
            />
          </View>
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-sm text-ui-shade/70">How credits are earned</Text>
          <Text className="mt-1 text-2xl font-bold">Ways to earn on Lumore</Text>
          <View className="mt-4 gap-2">
            {earnWays.map((item) => (
              <View
                key={item.title}
                className="rounded-lg border border-ui-shade/10 p-3"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="font-medium">{item.title}</Text>
                  <Text className="text-sm font-semibold text-ui-highlight">
                    {item.amount}
                  </Text>
                </View>
                <Text className="mt-1 text-sm text-ui-shade/70">
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <View className="flex-row items-center gap-2">
            <Icon name="cash-outline" type="Ionicons" size={16} />
            <Text className="text-lg font-semibold">How credits are distributed</Text>
          </View>
          <Text className="mt-2 text-sm text-ui-shade/70">
            Credit distribution is based on completed actions and approved
            contributions. Rewards are awarded only when each condition is fully
            satisfied and are protected against duplicate payouts where applicable.
          </Text>
          <View className="mt-3 gap-2">
            <Text className="text-sm text-ui-shade/80">
              - Rewarded ad grants +1 credit, up to 3 successful claims per rolling
              hour.
            </Text>
            <Text className="text-sm text-ui-shade/80">
              - Daily reward can be claimed once per UTC day.
            </Text>
            <Text className="text-sm text-ui-shade/80">
              - Referral bonus is paid only after the referred user is verified.
            </Text>
            <Text className="text-sm text-ui-shade/80">
              - Referral code cannot be self-applied and should come from a user
              who joined before you.
            </Text>
            <Text className="text-sm text-ui-shade/80">
              - This-or-That reward is paid only on admin approval of your
              question.
            </Text>
          </View>
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-lg font-semibold">What credits are used for</Text>
          <View className="mt-3 gap-2">
            {creditUses.map((item) => (
              <Text key={item} className="text-sm text-ui-shade/80">
                - {item}
              </Text>
            ))}
            <Text className="text-sm text-ui-shade/80">
              - Starting a new matched conversation currently costs 1 credit per
              participant.
            </Text>
          </View>
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-lg font-semibold">Future plan: Lumore Token</Text>
          <Text className="mt-2 text-sm text-ui-shade/80">
            We plan to launch a Lumore token in the future. The target model is 1
            credit = 1 Lumore token, designed to be tradable on the open market
            after launch.
          </Text>
          <Text className="mt-2 text-xs text-ui-shade/60">
            Note: Token launch, conversion, and market availability are future
            plans and are not live yet.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default EarnCreditsScreen;
