import { useMutation, useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { TextInput } from "../components/ui/TextInput";
import { applyReferralCode, fetchReferralSummary } from "../libs/apis";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import { referralCodeSchema } from "../schemas/referralSchema";
import { queryClient } from "../service/query-client";
import { buildReferralShareLink } from "../service/referralAttribution";
import {
  getPendingReferralCode,
  removePendingReferralCode,
  setPendingReferralCode,
} from "../service/storage";
import { ReferralSummary } from "../utils/types";
import { triggerSelectionHaptic } from "../utils/haptics";
import { toUserFacingError } from "../utils/userFacingError";

interface ReferralScreenProps {
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

const ReferralScreen: React.FC<ReferralScreenProps> = ({
  isRefreshing = false,
  onRefresh,
}) => {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["referral", "summary"],
    queryFn: fetchReferralSummary,
  });

  const summary: ReferralSummary | undefined = data?.data;
  const canAccess = Boolean(summary?.canAccess);
  const referredBy = summary?.referredBy;
  const referralShareLink = useMemo(() => {
    if (!summary?.referralCode) return null;
    return buildReferralShareLink(summary.referralCode);
  }, [summary?.referralCode]);

  const applyMutation = useMutation({
    mutationFn: applyReferralCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral", "summary"] });
    },
  });

  const canApply = useMemo(() => {
    return (
      canAccess &&
      Boolean(code.trim()) &&
      !referredBy &&
      !applyMutation.isPending
    );
  }, [canAccess, code, referredBy, applyMutation.isPending]);

  useEffect(() => {
    if (referredBy) {
      removePendingReferralCode();
      return;
    }

    if (code.trim()) return;

    const pendingCode = getPendingReferralCode();
    if (pendingCode) {
      setCode(pendingCode);
    }
  }, [code, referredBy]);

  const handleCopyCode = async () => {
    if (!summary?.referralCode) return;
    triggerSelectionHaptic();
    await Clipboard.setStringAsync(summary.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleCopyLink = async () => {
    if (!referralShareLink) return;
    triggerSelectionHaptic();
    await Clipboard.setStringAsync(referralShareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleApply = async () => {
    if (!canApply) return;
    triggerSelectionHaptic();
    const parsed = referralCodeSchema.safeParse(code);
    if (!parsed.success) {
      setCodeError(parsed.error.issues[0]?.message || "Invalid referral code.");
      return;
    }
    setCodeError("");
    try {
      await applyMutation.mutateAsync(parsed.data);
      setCode("");
      removePendingReferralCode();
    } catch (error: any) {
      setCodeError(
        toUserFacingError(
          error,
          "We couldn’t apply that referral code. Please check it and try again.",
        ),
      );
    }
  };

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Referral" />
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
                Invite rewards
              </Text>
              <Text
                className="mt-1 text-[32px] font-black leading-9 text-ui-light"
                accessibilityRole="header"
              >
                Bring good people to Lumore
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-light/70">
                Share your code and earn credits when invited friends complete
                verification.
              </Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="Gift" size={24} color={COLORS.shade} />
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-light p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-ui-muted">
                Your referral code
              </Text>
              <View className="mt-3 rounded-[24px] border border-ui-highlight/20 bg-ui-surface-page px-4 py-5">
                {isLoading ? (
                  <Skeleton width={180} height={30} />
                ) : (
                  <Text
                    className="text-[30px] font-black tracking-[3px] text-ui-shade"
                    selectable
                  >
                    {summary?.referralCode || "-"}
                  </Text>
                )}
              </View>
              <Text className="mt-3 text-sm leading-5 text-ui-muted">
                Earn +{summary?.referralRewardCredits ?? 10} credits when a
                referred user completes profile verification.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-primary/80">
              <Icon name="BadgePlus" size={20} color={COLORS.shade} />
            </View>
          </View>

          {!canAccess ? (
            <InfoPanel
              icon="BadgeAlert"
              text="Referral is only available to verified users."
            />
          ) : null}

          <View className="mt-4 flex-row gap-3">
            <CopyAction
              icon="Copy"
              label="Copy code"
              onPress={handleCopyCode}
              disabled={isLoading || !canAccess}
              primary
            />
            <CopyAction
              icon="Link"
              label="Copy link"
              onPress={handleCopyLink}
              disabled={isLoading || !canAccess || !referralShareLink}
            />
          </View>
          {copied ? (
            <View className="mt-3 flex-row items-center gap-2 rounded-full bg-ui-highlight/10 px-3 py-2">
              <Icon name="Check" size={15} color={COLORS.highlight} />
              <Text className="text-sm font-semibold text-ui-highlight">
                Copied
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-surface-page p-4">
          <SectionHeader
            icon="Ticket"
            title="Apply referral code"
            description="If someone invited you, apply their code before your account is linked."
          />
          <View className="mt-3">
            <TextInput
              label="Referral code"
              value={code}
              action={(val) => {
                setCode(val);
                setCodeError("");
                const nextCode = String(val || "").trim();
                if (nextCode) {
                  setPendingReferralCode(nextCode);
                } else {
                  removePendingReferralCode();
                }
              }}
              placeholder="Enter referral code"
            />
            {referredBy ? (
              <InfoPanel icon="BadgeCheck" text={`Already applied: ${referredBy}`} />
            ) : null}
            {codeError ? (
              <View className="mt-3 rounded-2xl bg-red-50 p-3">
                <Text className="text-sm font-medium text-red-600">
                  {codeError}
                </Text>
              </View>
            ) : null}
            <View className="mt-3">
              <Button
                text={applyMutation.isPending ? "Applying..." : "Apply code"}
                onClick={handleApply}
                disabled={!canApply}
              />
            </View>
          </View>
        </View>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-light p-5">
          <SectionHeader
            icon="ChartNoAxesColumn"
            title="Referral stats"
            description="Watch your invites turn into verified rewards."
          />
          <View className="mt-3 flex-row gap-2">
            <StatCard
              label="Referred"
              icon="Users"
              value={summary?.stats?.referredTotal ?? 0}
              isLoading={isLoading}
            />
            <StatCard
              label="Verified"
              icon="BadgeCheck"
              value={summary?.stats?.referredVerified ?? 0}
              isLoading={isLoading}
            />
            <StatCard
              label="Rewards"
              icon="Coins"
              value={summary?.stats?.rewardsEarned ?? 0}
              isLoading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const CopyAction = ({
  icon,
  label,
  onPress,
  disabled,
  primary = false,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    className={`min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full px-4 ${
      primary
        ? "bg-ui-highlight"
        : "border border-ui-highlight/25 bg-ui-light"
    } ${disabled ? "opacity-60" : "active:opacity-80"}`}
    accessibilityRole="button"
    accessibilityLabel={label}
    accessibilityState={{ disabled }}
  >
    <Icon
      name={icon}
      size={17}
      color={primary ? COLORS.light : COLORS.highlight}
    />
    <Text
      className={`font-semibold ${
        primary ? "text-ui-light" : "text-ui-highlight"
      }`}
    >
      {label}
    </Text>
  </Pressable>
);

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

const InfoPanel = ({ icon, text }: { icon: string; text: string }) => (
  <View className="mt-3 flex-row items-start gap-2 rounded-2xl bg-ui-highlight/10 p-3">
    <Icon name={icon} size={16} color={COLORS.highlight} />
    <Text className="flex-1 text-sm font-medium leading-5 text-ui-shade">
      {text}
    </Text>
  </View>
);

const StatCard = ({
  label,
  icon,
  value,
  isLoading,
}: {
  label: string;
  icon: string;
  value: number;
  isLoading?: boolean;
}) => (
  <View className="flex-1 items-center rounded-[22px] bg-ui-surface-page p-3">
    <View className="mb-2 h-9 w-9 items-center justify-center rounded-full bg-ui-highlight/10">
      <Icon name={icon} size={16} color={COLORS.highlight} />
    </View>
    <Text className="text-xs font-semibold text-ui-muted">{label}</Text>
    {isLoading ? (
      <Skeleton width={36} height={24} style={{ marginTop: 6 }} />
    ) : (
      <Text className="mt-1 text-xl font-black text-ui-shade">{value}</Text>
    )}
  </View>
);

export default ReferralScreen;
