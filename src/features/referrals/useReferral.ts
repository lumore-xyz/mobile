import { useMutation, useQuery } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { useEffect, useMemo, useState } from "react";
import { applyReferralCode, fetchReferralSummary } from "@/src/features/referrals/api";
import { referralQueryKeys } from "@/src/features/referrals/queryKeys";
import { referralCodeSchema } from "@/src/schemas/referralSchema";
import { queryClient } from "@/src/service/query-client";
import { buildReferralShareLink } from "@/src/service/referralAttribution";
import {
  getPendingReferralCode,
  removePendingReferralCode,
  setPendingReferralCode,
} from "@/src/service/storage";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { toUserFacingError } from "@/src/utils/userFacingError";
import type { ReferralSummary } from "@/src/utils/types";

export default function useReferral() {
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [copied, setCopied] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: referralQueryKeys.summary,
    queryFn: fetchReferralSummary,
  });
  const summary: ReferralSummary | undefined = data?.data;
  const canAccess = Boolean(summary?.canAccess);
  const referredBy = summary?.referredBy;
  const referralShareLink = useMemo(
    () => summary?.referralCode ? buildReferralShareLink(summary.referralCode) : null,
    [summary?.referralCode],
  );
  const applyMutation = useMutation({
    mutationFn: applyReferralCode,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: referralQueryKeys.summary });
    },
  });

  useEffect(() => {
    if (referredBy) {
      removePendingReferralCode();
      return;
    }
    if (!code.trim()) {
      const pendingCode = getPendingReferralCode();
      if (pendingCode) setCode(pendingCode);
    }
  }, [code, referredBy]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async (value?: string | null) => {
    if (!value) return;
    triggerSelectionHaptic();
    await Clipboard.setStringAsync(value);
    setCopied(true);
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    setCodeError("");
    const nextCode = value.trim();
    if (nextCode) setPendingReferralCode(nextCode);
    else removePendingReferralCode();
  };

  const handleApply = async () => {
    if (!canAccess || !code.trim() || referredBy || applyMutation.isPending) return;
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
    } catch (error: unknown) {
      setCodeError(
        toUserFacingError(
          error,
          "We couldn’t apply that referral code. Please check it and try again.",
        ),
      );
    }
  };

  return {
    summary,
    isLoading,
    canAccess,
    referredBy,
    referralShareLink,
    code,
    codeError,
    copied,
    isApplying: applyMutation.isPending,
    canApply: canAccess && Boolean(code.trim()) && !referredBy && !applyMutation.isPending,
    handleCopy,
    handleCodeChange,
    handleApply,
  };
}
