import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import { useUser } from "../hooks/useUser";
import { startDiditVerification } from "../libs/apis";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import { getUser } from "../service/storage";
import { triggerSelectionHaptic } from "../utils/haptics";

const SettingsScreen = () => {
  const currentUser = getUser();
  const { user } = useUser(currentUser?._id);
  const [isStartingVerification, setIsStartingVerification] = useState(false);

  const isVerified = useMemo(() => {
    return Boolean(user?.isVerified || user?.verificationStatus === "approved");
  }, [user]);

  const isPending = user?.verificationStatus === "pending";

  const handleStartVerification = async () => {
    if (isStartingVerification || isVerified) return;
    triggerSelectionHaptic();
    try {
      setIsStartingVerification(true);
      const response = await startDiditVerification();
      if (response?.verificationUrl) {
        await WebBrowser.openBrowserAsync(response.verificationUrl);
        return;
      }
    } catch (error) {
      console.error("Failed to start verification", error);
    } finally {
      setIsStartingVerification(false);
    }
  };

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Settings" fallbackHref="/profile" />
      <ScrollView className="px-4" contentContainerClassName="pb-10 pt-4">
        <View className="mb-5 overflow-hidden rounded-[32px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                className="text-[28px] font-bold leading-8 text-ui-light"
                accessibilityRole="header"
              >
                Your Lumore space
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-light/70">
                Manage your profile, preferences, rewards, and trust signals in
                one calm place.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="Settings" size={20} color={COLORS.shade} />
            </View>
          </View>
        </View>

        <SettingsSection
          title="Profile"
          description="Shape what people see before they message you."
          icon="UserRound"
        >
          <SettingsItem
            icon="UserRound"
            label="Edit profile"
            description="Photos, bio, basics, lifestyle, and visibility."
            onPress={() => router.navigate("/(subpage)/edit-profile")}
          />
          <SettingsItem
            icon="SlidersHorizontal"
            label="Edit preferences"
            description="Tune who you meet and what kind of connection you want."
            onPress={() => router.navigate("/(subpage)/edit-preference")}
          />
        </SettingsSection>

        <SettingsSection
          title="Account"
          description="Keep your account details and app settings current."
          icon="ShieldCheck"
        >
          <SettingsItem
            icon="Settings"
            label="User settings"
            description="Update account, notification, and privacy settings."
            onPress={() => router.navigate("/(subpage)/edit-user-settings")}
          />
        </SettingsSection>

        <SettingsSection
          title="Rewards"
          description="Track credits and invite people into Lumore."
          icon="Gift"
        >
          <SettingsItem
            icon="Wallet"
            label="Credits"
            description="View balance, earned credits, and credit history."
            onPress={() => router.navigate("/(subpage)/credits")}
          />
          <SettingsItem
            icon="Gift"
            label="Referral"
            description="Share Lumore and unlock referral rewards."
            onPress={() => router.navigate("/(subpage)/referral")}
          />
        </SettingsSection>

        <SettingsSection
          title="Community"
          description="Play, reflect, and share feedback."
          icon="MessageCircleHeart"
        >
          <SettingsItem
            icon="Gamepad2"
            label="Games"
            description="Answer prompts and playful profile questions."
            onPress={() => router.navigate("/(subpage)/games")}
          />
          <SettingsItem
            icon="MessageCircleMore"
            label="Feedback"
            description="Read feedback and relationship notes people shared."
            onPress={() => router.navigate("/(subpage)/feedback")}
          />
        </SettingsSection>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-light p-5">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-highlight/10">
              <Icon
                name={isVerified ? "BadgeCheck" : "BadgeAlert"}
                size={19}
                color={COLORS.highlight}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-shade">
                Verification
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">
                Verified profiles build trust and unlock referral rewards.
              </Text>
            </View>
          </View>
          {isVerified ? (
            <View className="mt-4 flex-row items-center gap-3 rounded-[22px] border border-ui-highlight/20 bg-ui-highlight/10 p-4">
              <Icon name="BadgeCheck" size={18} color={COLORS.highlight} />
              <Text className="font-semibold text-ui-highlight">
                Verified
              </Text>
            </View>
          ) : (
            <Button
              className="mt-4"
              text={
                isPending
                  ? "Verification pending"
                  : isStartingVerification
                    ? "Opening verification..."
                    : "Verify myself"
              }
              disabled={isPending || isStartingVerification}
              onClick={handleStartVerification}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const SettingsItem = ({
  icon,
  label,
  description,
  onPress,
}: {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={() => {
      triggerSelectionHaptic();
      onPress();
    }}
    className="mt-3 min-h-16 flex-row items-center justify-between gap-3 rounded-[22px] bg-ui-light p-4 active:opacity-80"
    android_ripple={{ color: "rgba(84,19,136,0.06)", borderless: false }}
    accessibilityRole="button"
    accessibilityLabel={`Open ${label}`}
  >
    <View className="flex-1 flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-highlight/10">
        <Icon name={icon} size={18} color={COLORS.highlight} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-ui-shade">{label}</Text>
        <Text className="mt-0.5 text-sm leading-5 text-ui-muted">
          {description}
        </Text>
      </View>
    </View>
    <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-surface-page">
      <Icon name="ChevronRight" size={17} color={COLORS.muted} />
    </View>
  </Pressable>
);

const SettingsSection = ({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: string;
  children: React.ReactNode;
}) => (
  <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-surface-page p-4">
    <View className="mb-1 flex-row items-start gap-3">
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
    {children}
  </View>
);

export default SettingsScreen;
