import React from "react";
import { ScrollView, Text, View } from "react-native";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import SurfacePanel from "@/src/components/ui/SurfacePanel";
import ReferralCopyAction from "../components/referral/ReferralCopyAction";
import ReferralInfoPanel from "../components/referral/ReferralInfoPanel";
import ReferralSectionHeader from "../components/referral/ReferralSectionHeader";
import ReferralStatCard from "../components/referral/ReferralStatCard";
import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { TextInput } from "../components/ui/TextInput";
import useReferral from "@/src/features/referrals/useReferral";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";

interface ReferralScreenProps {
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const ReferralScreen: React.FC<ReferralScreenProps> = ({
  isRefreshing = false,
  onRefresh,
}) => {
  const {
    summary,
    isLoading,
    canAccess,
    referredBy,
    referralShareLink,
    code,
    codeError,
    copied,
    isApplying,
    canApply,
    handleCopy,
    handleCodeChange,
    handleApply,
  } = useReferral();

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Referral" />
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
                Invite rewards
              </Text>
              <Text
                className="mt-1 font-display text-[32px] leading-9 text-ui-paper"
                accessibilityRole="header"
              >
                Bring good people to Lumore
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-paper/70">
                Share your code and earn credits when invited friends complete
                verification.
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="Gift" size={24} color={COLORS.ink} />
            </View>
          </View>
        </SurfacePanel>

        <SurfacePanel surface="paper" className="mt-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ui-slate">
                Your referral code
              </Text>
              <View className="mt-3 rounded-[24px] border border-ui-forest/20 bg-ui-surface-page px-4 py-5">
                {isLoading ? (
                  <Skeleton width={180} height={30} />
                ) : (
                  <Text
                    className="text-[30px] font-semibold tracking-[3px] text-ui-ink"
                    selectable
                  >
                    {summary?.referralCode || "-"}
                  </Text>
                )}
              </View>
              <Text className="mt-3 text-sm leading-5 text-ui-slate">
                Earn +{summary?.referralRewardCredits ?? 10} credits when a
                referred user completes profile verification.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-champagne/80">
              <Icon name="BadgePlus" size={20} color={COLORS.ink} />
            </View>
          </View>

          {!canAccess ? (
            <ReferralInfoPanel
              icon="BadgeAlert"
              text="Referral is only available to verified users."
            />
          ) : null}

          <View className="mt-4 flex-row gap-3">
            <ReferralCopyAction
              icon="Copy"
              label="Copy code"
              onPress={() => void handleCopy(summary?.referralCode)}
              disabled={isLoading || !canAccess}
              primary
            />
            <ReferralCopyAction
              icon="Link"
              label="Copy link"
              onPress={() => void handleCopy(referralShareLink)}
              disabled={isLoading || !canAccess || !referralShareLink}
            />
          </View>
          {copied ? (
            <View className="mt-3 flex-row items-center gap-2 rounded-full bg-ui-forest/10 px-3 py-2">
              <Icon name="Check" size={15} color={COLORS.forest} />
              <Text className="text-sm font-semibold text-ui-forest">
                Copied
              </Text>
            </View>
          ) : null}
        </SurfacePanel>

        <View className="mt-5 rounded-[24px] border border-ui-parchment bg-ui-surface-page p-4">
          <ReferralSectionHeader
            icon="Ticket"
            title="Apply referral code"
            description="If someone invited you, apply their code before your account is linked."
          />
          <View className="mt-3">
            <TextInput
              label="Referral code"
              value={code}
              action={handleCodeChange}
              placeholder="Enter referral code"
            />
            {referredBy ? (
              <ReferralInfoPanel icon="BadgeCheck" text={`Already applied: ${referredBy}`} />
            ) : null}
            {codeError ? (
              <View className="mt-3 rounded-2xl bg-ui-danger/5 p-3">
                <Text className="text-sm font-medium text-ui-danger">
                  {codeError}
                </Text>
              </View>
            ) : null}
            <View className="mt-3">
              <Button
                text={isApplying ? "Applying..." : "Apply code"}
                onClick={handleApply}
                disabled={!canApply}
              />
            </View>
          </View>
        </View>

        <SurfacePanel surface="paper" className="mt-5">
          <ReferralSectionHeader
            icon="ChartNoAxesColumn"
            title="Referral stats"
            description="Watch your invites turn into verified rewards."
          />
          <View className="mt-3 flex-row gap-2">
            <ReferralStatCard
              label="Referred"
              icon="Users"
              value={summary?.stats?.referredTotal ?? 0}
              isLoading={isLoading}
            />
            <ReferralStatCard
              label="Verified"
              icon="BadgeCheck"
              value={summary?.stats?.referredVerified ?? 0}
              isLoading={isLoading}
            />
            <ReferralStatCard
              label="Rewards"
              icon="Coins"
              value={summary?.stats?.rewardsEarned ?? 0}
              isLoading={isLoading}
            />
          </View>
        </SurfacePanel>
      </ScrollView>
    </View>
  );
};

export default ReferralScreen;
