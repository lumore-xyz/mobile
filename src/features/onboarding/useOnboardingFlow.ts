import buildOnboardingPayload from "@/src/features/onboarding/buildOnboardingPayload";
import getInitialValuesForScreen from "@/src/features/onboarding/getInitialValuesForScreen";
import resolveOnboardingFieldError from "@/src/features/onboarding/resolveOnboardingFieldError";
import validateScreen from "@/src/features/onboarding/validateScreen";
import { applyReferralCode } from "@/src/features/referrals/api";
import { setNewPassword } from "@/src/features/authentication/api";
import { updateUserData, updateUserPreferences } from "@/src/features/profile/api";
import { profileQueryKeys } from "@/src/features/profile/queryKeys";
import type { Screen } from "@/src/features/onboarding/types";
import { useUser } from "@/src/hooks/useUser";
import { useUserPrefrence } from "@/src/hooks/useUserPrefrence";
import { referralCodeSchema } from "@/src/schemas/referralSchema";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  capturePendingReferralCode,
  getPendingReferralCode,
  getUser,
  removePendingReferralCode,
  setIsOnboarded,
  setPendingReferralCode,
} from "@/src/service/storage";
import { toUserFacingError } from "@/src/utils/userFacingError";
import { triggerSelectionHaptic } from "@/src/utils/haptics";

const ONBOARDING_DESCRIPTIONS: Record<string, string> = {
  intro: "A few details help your profile feel like you.",
  contact: "Your contact details stay private and keep your account secure.",
  identity: "Tell us who you are and who you would like to meet.",
  tuning: "Set the age range and distance that feel right for you.",
  intentions: "Shared intentions make it easier to find a real connection.",
};

const useOnboardingFlow = (screens: Screen[]) => {
  const userId = getUser()?._id;
  const { user } = useUser(userId);
  const { userPrefrence } = useUserPrefrence(userId);
  const [screenIndex, setScreenIndex] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const incomingReferralCode = String(params.code || "").trim();

  const currentScreen = screens[screenIndex];
  const totalScreens = screens.length;
  const progress = ((screenIndex + 1) / totalScreens) * 100;
  const description =
    ONBOARDING_DESCRIPTIONS[currentScreen.id] ??
    "A few thoughtful details help Lumore make better introductions.";

  useEffect(() => {
    const values = getInitialValuesForScreen(currentScreen, user, userPrefrence);
    if (incomingReferralCode) {
      const parsedIncomingCode =
        referralCodeSchema.safeParse(incomingReferralCode);
      if (parsedIncomingCode.success) {
        capturePendingReferralCode(parsedIncomingCode.data);
      }
    }

    if (currentScreen.fields.some((field) => field.name === "referralCode")) {
      const storedCode = getPendingReferralCode();
      if (storedCode && !values.referralCode) {
        values.referralCode = storedCode;
      }
    }
    setFormValues(values);
    setSubmitError("");
  }, [currentScreen, user, userPrefrence, incomingReferralCode]);

  const handleInputChange = useCallback((name: string, value: unknown) => {
    if (name === "referralCode") {
      const nextCode = String(value || "").trim();
      if (nextCode) {
        setPendingReferralCode(nextCode);
      } else {
        removePendingReferralCode();
      }
    }
    setSubmitError("");
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const screenErrors = useMemo(
    () => validateScreen(currentScreen, formValues),
    [currentScreen, formValues],
  );

  const submitOnboardingData = async () => {
    const { userData, userPreferenceData, password } = buildOnboardingPayload(
      currentScreen,
      formValues,
    );
    const referralCodeRaw =
      typeof formValues.referralCode === "string"
        ? formValues.referralCode
        : "";
    const referralCode = referralCodeRaw.trim();
    const hasReferralCodeField = currentScreen.fields.some(
      (field) => field.name === "referralCode",
    );

    if (Object.keys(userData).length) await updateUserData(userData);
    if (Object.keys(userPreferenceData).length) {
      await updateUserPreferences(userPreferenceData);
    }
    if (password) await setNewPassword({ newPassword: password });

    if (hasReferralCodeField && referralCode) {
      try {
        await applyReferralCode(referralCode);
        removePendingReferralCode();
      } catch (error: unknown) {
        const message = toUserFacingError(
          error,
          "That referral code didn’t work. Please check it and try again.",
        );
        setErrors((prev) => ({ ...prev, referralCode: message }));
        throw error;
      }
    }
  };

  const handleNext = async () => {
    if (Object.keys(screenErrors).length > 0) {
      setErrors(screenErrors);
      setSubmitError("");
      return;
    }

    setErrors({});
    setSubmitError("");
    try {
      await submitOnboardingData();
    } catch (error: unknown) {
      const fieldError = resolveOnboardingFieldError(error, currentScreen);
      if (fieldError) {
        setErrors((prev) => ({
          ...prev,
          [fieldError.fieldName]: fieldError.message,
        }));
      } else {
        setSubmitError(
          toUserFacingError(
            error,
            "We couldn’t save this step right now. Please try again.",
          ),
        );
      }
      return;
    }

    if (screenIndex < totalScreens - 1) {
      setScreenIndex((prev) => prev + 1);
      return;
    }

    if (userId) {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: profileQueryKeys.user(userId),
          refetchType: "all",
        }),
        queryClient.invalidateQueries({
          queryKey: profileQueryKeys.preferences(userId),
          refetchType: "all",
        }),
      ]);
    }

    setIsOnboarded(userId, true);
    router.replace("/profile");
  };

  const handleBack = useCallback(() => {
    triggerSelectionHaptic();
    setScreenIndex((index) => Math.max(0, index - 1));
  }, []);

  return {
    currentScreen,
    screenIndex,
    totalScreens,
    progress,
    description,
    formValues,
    errors,
    submitError,
    handleInputChange,
    handleNext,
    handleBack,
  };
};

export default useOnboardingFlow;
