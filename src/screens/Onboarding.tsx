import Button from "@/src/components/ui/Button";
import { VStack } from "@/src/components/ui/vstack";
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
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";

const DUPLICATE_FIELD_MESSAGES: Record<string, string> = {
  phoneNumber: "This phone number is already in use. Please use another.",
  email: "This email is already in use. Please use another.",
  username: "This username is already in use. Please use another.",
};

const extractApiMessage = (error: any) =>
  String(
    error?.response?.data?.message ||
      error?.message ||
      "Unable to save this step right now. Please try again.",
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
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          "Invalid referral code. Please check and try again.";
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
    } catch (error: any) {
      const apiMessage = extractApiMessage(error);
      const fieldError = resolveFieldErrorFromApi(apiMessage, currentScreen);

      if (fieldError) {
        setErrors((prev) => ({ ...prev, [fieldError.fieldName]: fieldError.message }));
      } else {
        setSubmitError(apiMessage);
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
    <View className="flex-1 p-4">
      <View className="w-full rounded-full border border-ui-highlight/20 overflow-hidden">
        <View
          style={{ width: `${progress}%` }}
          className="rounded-full h-2 bg-ui-highlight"
        />
      </View>

      <View className="flex-1 justify-start items-center mt-6 w-full">
        <View className="w-full flex-1">
          <View className="my-6">
            <Text className="text-3xl font-bold text-ui-dark mb-2">
              {currentScreen.title}
            </Text>
          </View>
          <ScrollView>
            <VStack className="gap-8">
              {currentScreen.fields.map((field) => (
                <View key={field.name} className="w-full">
                  <OnboardingFieldRenderer
                    field={field}
                    value={formValues[field.name]}
                    onChange={handleInputChange}
                    errorText={errors[field.name]}
                  />
                </View>
              ))}
            </VStack>
          </ScrollView>
        </View>

        <View className="w-full mt-6">
          {submitError ? (
            <Text className="text-sm text-red-500 mb-3">{submitError}</Text>
          ) : null}
          <Button
            onClick={handleNext}
            text={screenIndex === totalScreens - 1 ? "Let's Go..." : "Next"}
          />
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;
