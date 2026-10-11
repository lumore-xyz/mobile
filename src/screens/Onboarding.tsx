import Button from "@/src/components/ui/Button";
import Icon from "@/src/libs/Icon";
import { onboardingScreens } from "@/src/features/onboarding/config";
import OnboardingFieldRenderer from "@/src/features/onboarding/OnboardingFieldRenderer";
import type { Screen } from "@/src/features/onboarding/types";
import useOnboardingFlow from "@/src/features/onboarding/useOnboardingFlow";
import React from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import LUMORE_WORDMARK from "@/assets/images/lumore-hr.webp";

const OnboardingScreen = ({
  screens = onboardingScreens,
}: {
  screens?: Screen[];
}) => {
  const {
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
  } = useOnboardingFlow(screens);

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
              onPress={handleBack}
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
