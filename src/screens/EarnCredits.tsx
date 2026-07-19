import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import { useAd } from "../hooks/useAd";
import { claimRewardedAdCredit, fetchCreditsBalance } from "../libs/apis";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import { queryClient } from "../service/query-client";
import { triggerSelectionHaptic } from "../utils/haptics";

const earnWays = [
  {
    title: "Rewarded ad watch",
    icon: "Video",
    amount: "+1 (max 3/hour)",
    description:
      "Watch a rewarded ad and earn +1 credit. Up to 3 successful ad rewards are granted per rolling hour.",
  },
  {
    title: "Daily activity",
    icon: "CalendarCheck",
    amount: "+1 / +3",
    description:
      "Claim once per UTC day. Unverified users get +1, verified users get +3.",
  },
  {
    title: "Signup bonus",
    icon: "PartyPopper",
    amount: "+10",
    description: "Granted once for new users.",
  },
  {
    title: "This-or-That approvals",
    icon: "BadgeCheck",
    amount: "+5",
    description:
      "Awarded when your submitted question is approved. Each question is rewarded once.",
  },
  {
    title: "Referral rewards",
    icon: "Gift",
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
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Earn Credits" />
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
                Rewards
              </Text>
              <Text
                className="mt-1 text-[32px] font-black leading-9 text-ui-light"
                accessibilityRole="header"
              >
                Earn credits for showing up
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-light/70">
                Credits power premium moments on Lumore. Earn them through
                activity, referrals, approved contributions, and rewarded ads.
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="Sparkles" size={24} color={COLORS.shade} />
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-light p-5">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-highlight/10">
              <Icon name="Video" size={19} color={COLORS.highlight} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-shade">
                Watch ad for credits
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">
                Earn +1 credit per successful rewarded ad completion.
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <QuotaPill
              icon="Gauge"
              label="Hourly quota"
              value={`${rewardedWatched}/${rewardedMax} used`}
            />
            <QuotaPill
              icon="Clock3"
              label="Remaining"
              value={`${Math.max(rewardedRemaining, 0)}`}
            />
          </View>

          {isHourlyCapped && nextEligibleLabel ? (
            <InfoPanel
              tone="warning"
              text={`Next ad reward window opens at ${nextEligibleLabel}.`}
            />
          ) : null}
          {!isRewardedLoaded ? (
            <InfoPanel tone="muted" text="Rewarded ad is loading..." />
          ) : null}
          {statusMessage ? (
            <InfoPanel tone="highlight" text={statusMessage} />
          ) : null}

          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              void handleWatchRewardedAd();
            }}
            disabled={isWatchDisabled}
            className={`mt-4 min-h-12 flex-row items-center justify-center gap-2 rounded-full bg-ui-highlight px-4 ${
              isWatchDisabled ? "opacity-60" : "active:opacity-80"
            }`}
            accessibilityRole="button"
            accessibilityLabel={watchButtonText}
            accessibilityState={{ disabled: isWatchDisabled }}
          >
            <Icon name="PlayCircle" size={18} color={COLORS.light} />
            <Text className="font-semibold text-ui-light">
              {watchButtonText}
            </Text>
          </Pressable>
        </View>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-surface-page p-4">
          <SectionHeader
            icon="BadgePlus"
            title="Ways to earn on Lumore"
            description="A quick map of every reward path."
          />
          <View className="mt-3 gap-3">
            {earnWays.map((item) => (
              <View
                key={item.title}
                className="rounded-[22px] bg-ui-light p-4"
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 flex-row items-start gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-highlight/10">
                      <Icon name={item.icon} size={18} color={COLORS.highlight} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-ui-shade">
                        {item.title}
                      </Text>
                      <Text className="mt-1 text-sm leading-5 text-ui-muted">
                        {item.description}
                      </Text>
                    </View>
                  </View>
                  <View className="rounded-full bg-ui-primary px-3 py-1">
                    <Text className="text-sm font-bold text-ui-shade">
                      {item.amount}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-light p-5">
          <SectionHeader
            icon="ShieldCheck"
            title="How credits are distributed"
            description="Rewards are checked before credits are granted."
          />
          <Text className="mt-3 text-sm leading-5 text-ui-muted">
            Credit distribution is based on completed actions and approved
            contributions. Rewards are awarded only when each condition is fully
            satisfied and are protected against duplicate payouts where
            applicable.
          </Text>
          <View className="mt-4 gap-2">
            {[
              "Rewarded ad grants +1 credit, up to 3 successful claims per rolling hour.",
              "Daily reward can be claimed once per UTC day.",
              "Referral bonus is paid only after the referred user is verified.",
              "Referral code cannot be self-applied and should come from a user who joined before you.",
              "This-or-That reward is paid only on admin approval of your question.",
            ].map((item) => (
              <RuleRow key={item} text={item} />
            ))}
          </View>
        </View>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-surface-page p-4">
          <SectionHeader
            icon="WalletCards"
            title="What credits are used for"
            description="Credits power premium actions across Lumore."
          />
          <View className="mt-3 gap-2">
            {creditUses.map((item) => (
              <RuleRow key={item} text={item} />
            ))}
            <RuleRow text="Starting a new matched conversation currently costs 1 credit per participant." />
          </View>
        </View>

        <View className="mt-5 rounded-[28px] border border-ui-primary/30 bg-ui-primary/20 p-5">
          <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-ui-light">
            <Icon name="Coins" size={20} color={COLORS.highlight} />
          </View>
          <Text className="text-xl font-bold text-ui-shade">
            Future plan: Lumore Token
          </Text>
          <Text className="mt-2 text-sm leading-5 text-ui-shade/80">
            We plan to launch a Lumore token in the future. The target model is
            1 credit = 1 Lumore token, designed to be tradable on the open
            market after launch.
          </Text>
          <Text className="mt-3 text-xs leading-4 text-ui-muted">
            Note: Token launch, conversion, and market availability are future
            plans and are not live yet.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const SectionHeader = ({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <View className="flex-row items-start gap-3">
    <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-highlight/10">
      <Icon name={icon} size={18} color={COLORS.highlight} />
    </View>
    <View className="flex-1">
      <Text className="text-xl font-bold text-ui-shade">{title}</Text>
      <Text className="mt-1 text-sm leading-5 text-ui-muted">
        {description}
      </Text>
    </View>
  </View>
);

const QuotaPill = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View className="flex-1 rounded-[22px] bg-ui-surface-page p-3">
    <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-ui-highlight/10">
      <Icon name={icon} size={16} color={COLORS.highlight} />
    </View>
    <Text className="text-xs font-semibold text-ui-muted">{label}</Text>
    <Text className="mt-1 text-sm font-bold text-ui-shade">{value}</Text>
  </View>
);

const RuleRow = ({ text }: { text: string }) => (
  <View className="flex-row items-start gap-2 rounded-2xl bg-ui-light p-3">
    <View className="mt-1 h-2 w-2 rounded-full bg-ui-highlight" />
    <Text className="flex-1 text-sm leading-5 text-ui-shade">{text}</Text>
  </View>
);

const InfoPanel = ({
  text,
  tone,
}: {
  text: string;
  tone: "highlight" | "muted" | "warning";
}) => {
  const toneClass =
    tone === "warning"
      ? "bg-ui-primary/20"
      : tone === "highlight"
        ? "bg-ui-highlight/10"
        : "bg-ui-surface-page";

  return (
    <View className={`mt-3 rounded-2xl p-3 ${toneClass}`}>
      <Text className="text-sm font-medium leading-5 text-ui-shade">
        {text}
      </Text>
    </View>
  );
};

export default EarnCreditsScreen;
