import Button from "@/src/components/ui/Button";
import Icon from "@/src/libs/Icon";
import { onboardingScreens } from "@/src/features/onboarding/config";
import {
  buildOnboardingPayload,
  getInitialValuesForScreen,
  validateScreen,
} from "@/src/features/onboarding/helpers";
import OnboardingFieldRenderer from "@/src/features/onboarding/OnboardingFieldRenderer";
import type { Screen } from "@/src/features/onboarding/types";
import { useUser } from "@/src/hooks/useUser";
import { useUserPrefrence } from "@/src/hooks/useUserPrefrence";
import {
  applyReferralCode,
  setNewPassword,
  updateUserData,
  updateUserPreferences,
} from "@/src/libs/apis";
import { referralCodeSchema } from "@/src/schemas/referralSchema";
import {
  capturePendingReferralCode,
  getPendingReferralCode,
  getUser,
  removePendingReferralCode,
  setIsOnboarded,
  setPendingReferralCode,
} from "@/src/service/storage";
import { toUserFacingError } from "@/src/utils/userFacingError";
import { isAxiosError } from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import LUMORE_WORDMARK from "@/assets/images/lumore-hr.png";

const DUPLICATE_FIELD_MESSAGES: Record<string, string> = {
  phoneNumber: "This phone number is already in use. Please use another.",
  email: "This email is already in use. Please use another.",
  username: "This username is already in use. Please use another.",
};

const ONBOARDING_DESCRIPTIONS: Record<string, string> = {
  intro: "A few details help your profile feel like you.",
  contact: "Your contact details stay private and keep your account secure.",
  identity: "Tell us who you are and who you would like to meet.",
  tuning: "Set the age range and distance that feel right for you.",
  intentions: "Shared intentions make it easier to find a real connection.",
};

const extractApiMessage = (error: unknown) => {
  const responseMessage = isAxiosError<{ message?: unknown }>(error)
    ? error.response?.data?.message
    : undefined;
  if (typeof responseMessage === "string") return responseMessage;
  if (error instanceof Error) return error.message;
  return "Unable to save this step right now. Please try again.";
};

const getFriendlyOnboardingError = (error: unknown) =>
  toUserFacingError(
    error,
    "We couldn’t save this step right now. Please try again.",
  );

const extractDuplicateField = (message: string) => {
  const indexMatch = message.match(/index:\s*([A-Za-z0-9._$-]+)_1/i);
  if (indexMatch?.[1]) {
    const indexField = indexMatch[1].split(".").pop();
    if (indexField) return indexField;
  }

  const duplicateKeyMatch = message.match(
    /dup key:\s*\{\s*"?([A-Za-z0-9._$-]+)"?\s*:/i,
  );
  if (duplicateKeyMatch?.[1]) {
    return duplicateKeyMatch[1].split(".").pop() || duplicateKeyMatch[1];
  }

  return null;
};

const resolveFieldErrorFromApi = (message: string, screen: Screen) => {
  const normalized = message.toLowerCase();
  const hasDuplicateSignature =
    normalized.includes("e11000") || normalized.includes("duplicate key");

  if (hasDuplicateSignature) {
    const duplicateField = extractDuplicateField(message);

    if (
      duplicateField &&
      screen.fields.some((field) => field.name === duplicateField)
    ) {
      return {
        fieldName: duplicateField,
        message:
          DUPLICATE_FIELD_MESSAGES[duplicateField] ||
          "This value already exists. Please use a different one.",
      };
    }

    if (normalized.includes("phone") || normalized.includes("phonenumber")) {
      if (screen.fields.some((field) => field.name === "phoneNumber")) {
        return {
          fieldName: "phoneNumber",
          message: DUPLICATE_FIELD_MESSAGES.phoneNumber,
        };
      }
    }

    if (normalized.includes("email")) {
      if (screen.fields.some((field) => field.name === "email")) {
        return {
          fieldName: "email",
          message: DUPLICATE_FIELD_MESSAGES.email,
        };
      }
    }
  }

  if (
    normalized.includes("referral") &&
    screen.fields.some((field) => field.name === "referralCode")
  ) {
    return {
      fieldName: "referralCode",
      message,
    };
  }

  return null;
};

const OnboardingScreen = ({
  screens = onboardingScreens,
}: {
  screens?: Screen[];
}) => {
  const currentUser = getUser();
  const userId = currentUser?._id;
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
    if (!currentScreen) return;
    const values = getInitialValuesForScreen(
      currentScreen,
      user,
      userPrefrence,
    );
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

  const handleInputChange = (name: string, value: unknown) => {
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
  };

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

    if (Object.keys(userData).length) {
      await updateUserData(userData);
    }
    if (Object.keys(userPreferenceData).length) {
      await updateUserPreferences(userPreferenceData);
    }
    if (password) {
      await setNewPassword({ newPassword: password });
    }

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
      const apiMessage = extractApiMessage(error);
      const fieldError = resolveFieldErrorFromApi(apiMessage, currentScreen);

      if (fieldError) {
        setErrors((prev) => ({ ...prev, [fieldError.fieldName]: fieldError.message }));
      } else {
        setSubmitError(getFriendlyOnboardingError(error));
      }
      return;
    }

    if (screenIndex < totalScreens - 1) {
      setScreenIndex((prev) => prev + 1);
      return;
    }

    if (userId) {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["user", userId] }),
        queryClient.invalidateQueries({ queryKey: ["user-profile", userId] }),
        queryClient.refetchQueries({ queryKey: ["user", userId], type: "all" }),
        queryClient.refetchQueries({
          queryKey: ["user-profile", userId],
          type: "all",
        }),
      ]);
    }

    setIsOnboarded(userId, true);
    router.replace("/profile");
  };

  return (
    <View className="flex-1 bg-ui-surface-page">
      <View className="px-5 pb-5 pt-4">
        <View className="mb-6 flex-row items-center justify-between">
          <Image
            source={LUMORE_WORDMARK}
            accessibilityLabel="Lumore"
            resizeMode="contain"
            className="h-12 w-28"
          />
          <View className="rounded-full bg-ui-forest/10 px-3 py-2">
            <Text className="text-xs font-bold text-ui-forest">
              STEP {screenIndex + 1} OF {totalScreens}
            </Text>
          </View>
        </View>

        <View
          className="h-2 overflow-hidden rounded-full bg-ui-parchment/60"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View
            style={{ width: `${progress}%` }}
            className="h-full rounded-full bg-ui-forest"
          />
        </View>

        <Text
          className="mt-7 font-display text-3xl leading-9 text-ui-midnight"
          accessibilityRole="header"
        >
          {currentScreen.title}
        </Text>
        <Text className="mt-2 text-base leading-6 text-ui-slate">
          {description}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-6"
      >
        <View className="rounded-[24px] border border-ui-parchment/70 bg-ui-paper p-5">
          <View className="gap-6">
            {currentScreen.fields.map((field) => (
              <OnboardingFieldRenderer
                key={field.name}
                field={field}
                value={formValues[field.name]}
                onChange={handleInputChange}
                errorText={errors[field.name]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="border-t border-ui-parchment bg-ui-paper px-5 pb-4 pt-4">
        {submitError ? (
          <View
            className="mb-3 flex-row items-center gap-2 rounded-2xl bg-ui-danger/10 px-4 py-3"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
          >
            <Icon name="CircleAlert" size={18} className="text-ui-danger" />
            <Text className="flex-1 text-sm font-medium leading-5 text-ui-danger">
              {submitError}
            </Text>
          </View>
        ) : null}
        <View className="flex-row items-center gap-3">
          {screenIndex > 0 ? (
            <Pressable
              onPress={() => {
                triggerSelectionHaptic();
                setScreenIndex((index) => Math.max(0, index - 1));
              }}
              className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-ui-parchment bg-ui-paper active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Go to previous onboarding step"
            >
              <Icon name="ArrowLeft" size={17} className="text-ui-midnight" />
              <Text className="font-semibold text-ui-midnight">Back</Text>
            </Pressable>
          ) : null}
          <Button
            onClick={handleNext}
            text={screenIndex === totalScreens - 1 ? "Finish profile" : "Continue"}
            className="flex-1"
          />
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;
