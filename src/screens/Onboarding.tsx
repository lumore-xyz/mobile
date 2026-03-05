import Button from "@/src/components/ui/Button";
import { VStack } from "@/src/components/ui/vstack";
import {
  legacyOnboardingScreens,
  onboardingScreens,
} from "@/src/features/onboarding/config";
import { useUser } from "@/src/hooks/useUser";
import { useUserPrefrence } from "@/src/hooks/useUserPrefrence";
import {
  buildOnboardingPayload,
  getInitialValuesForScreen,
  validateScreen,
} from "@/src/features/onboarding/helpers";
import OnboardingFieldRenderer from "@/src/features/onboarding/OnboardingFieldRenderer";
import type { Screen } from "@/src/features/onboarding/types";
import { isUiSimplificationEnabled } from "@/src/libs/feature-flags";
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

const OnboardingScreen = ({
  screens = isUiSimplificationEnabled()
    ? onboardingScreens
    : legacyOnboardingScreens,
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
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string }>();
  const incomingReferralCode = String(params.code || "").trim();

  const currentScreen = screens[screenIndex];
  const totalScreens = screens.length;
  const progress = ((screenIndex + 1) / totalScreens) * 100;

  useEffect(() => {
    if (!currentScreen) return;
    const values = getInitialValuesForScreen(currentScreen, user, userPrefrence);
    if (incomingReferralCode) {
      const parsedIncomingCode = referralCodeSchema.safeParse(incomingReferralCode);
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
      typeof formValues.referralCode === "string" ? formValues.referralCode : "";
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
      return;
    }

    setErrors({});
    try {
      await submitOnboardingData();
    } catch {
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

