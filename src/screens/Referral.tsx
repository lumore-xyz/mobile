import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { TextInput } from "../components/ui/TextInput";
import { referralCodeSchema } from "../schemas/referralSchema";
import { applyReferralCode, fetchReferralSummary } from "../libs/apis";
import { queryClient } from "../service/query-client";
import { buildReferralShareLink } from "../service/referralAttribution";
import {
  getPendingReferralCode,
  removePendingReferralCode,
  setPendingReferralCode,
} from "../service/storage";
import { ReferralSummary } from "../utils/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const ReferralScreen = () => {
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
    await Clipboard.setStringAsync(summary.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleCopyLink = async () => {
    if (!referralShareLink) return;
    await Clipboard.setStringAsync(referralShareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleApply = async () => {
    if (!canApply) return;
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
      setCodeError(error?.response?.data?.message || "Could not apply referral code");
    }
  };

  return (
    <View className="flex-1 bg-ui-light">
      <SubPageBack title="Referral" />
      <ScrollView className="p-4" contentContainerClassName="pb-10">
        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-sm text-ui-shade/70">Your referral code</Text>
          <View className="mt-2">
            {isLoading ? (
              <Skeleton width={180} height={30} />
            ) : (
              <Text className="text-2xl font-bold">
                {summary?.referralCode || "-"}
              </Text>
            )}
          </View>
          <Text className="mt-2 text-sm text-ui-shade/70">
            Earn +{summary?.referralRewardCredits ?? 10} credits when a referred
            user completes profile verification.
          </Text>

          {!canAccess ? (
            <Text className="mt-3 rounded-lg bg-ui-shade/10 px-3 py-2 text-sm text-ui-shade">
              Referral is only available to verified users.
            </Text>
          ) : null}

          <View className="mt-4 flex-row gap-2">
            <View className="flex-1">
              <Button
                text="Copy code"
                onClick={handleCopyCode}
                disabled={isLoading || !canAccess}
              />
            </View>
            <View className="flex-1">
              <Button
                variant="outline"
                text="Copy link"
                onClick={handleCopyLink}
                disabled={isLoading || !canAccess || !referralShareLink}
              />
            </View>
          </View>
          {copied ? <Text className="mt-2 text-xs text-green-600">Copied</Text> : null}
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4 mt-4">
          <Text className="text-lg font-semibold">Apply referral code</Text>
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
              <Text className="text-sm text-ui-shade/70 mt-2">
                Already applied: {referredBy}
              </Text>
            ) : null}
            {codeError ? <Text className="text-sm text-red-500 mt-2">{codeError}</Text> : null}
            <View className="mt-3">
              <Button
                text={applyMutation.isPending ? "Applying..." : "Apply code"}
                onClick={handleApply}
                disabled={!canApply}
              />
            </View>
          </View>
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4 mt-4">
          <Text className="text-lg font-semibold">Referral stats</Text>
          <View className="mt-3 flex-row gap-2">
            <StatCard
              label="Referred"
              value={summary?.stats?.referredTotal ?? 0}
              isLoading={isLoading}
            />
            <StatCard
              label="Verified"
              value={summary?.stats?.referredVerified ?? 0}
              isLoading={isLoading}
            />
            <StatCard
              label="Rewards"
              value={summary?.stats?.rewardsEarned ?? 0}
              isLoading={isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const StatCard = ({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: number;
  isLoading?: boolean;
}) => (
  <View className="flex-1 rounded-lg border border-ui-shade/10 p-3 items-center">
    <Text className="text-xs text-ui-shade/70">{label}</Text>
    {isLoading ? (
      <Skeleton width={36} height={24} style={{ marginTop: 6 }} />
    ) : (
      <Text className="text-xl font-semibold mt-1">{value}</Text>
    )}
  </View>
);

export default ReferralScreen;
