import SurfacePanel from "@/src/components/ui/SurfacePanel";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import SettingsNavigationItem from "@/src/components/settings/SettingsNavigationItem";
import SettingsSection from "@/src/components/settings/SettingsSection";
import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import { useUser } from "../hooks/useUser";
import { startHaloKycVerification } from "@/src/features/identity-verification/api";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import { getUser } from "../service/storage";
import { triggerSelectionHaptic } from "../utils/haptics";

const SettingsScreen = () => {
  const currentUser = getUser();
  const { user } = useUser(currentUser?._id);
  const [isStartingVerification, setIsStartingVerification] = useState(false);

  const isVerified = Boolean(
    user?.isVerified || user?.verificationStatus === "approved",
  );

  const isPending = user?.verificationStatus === "pending";
  const isProcessing = user?.verificationStatus === "processing";

  const handleStartVerification = async () => {
    if (isStartingVerification || isVerified) return;
    triggerSelectionHaptic();
    try {
      setIsStartingVerification(true);
      const response = await startHaloKycVerification();
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
        <SurfacePanel surface="midnight" className="mb-5 overflow-hidden">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                className="text-[28px] font-bold leading-8 text-ui-paper"
                accessibilityRole="header"
              >
                Your Lumore space
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-paper/70">
                Manage your profile, preferences, rewards, and trust signals in
                one calm place.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="Settings" size={20} color={COLORS.ink} />
            </View>
          </View>
        </SurfacePanel>

        <SettingsSection
          variant="card"
          title="Profile"
          description="Shape what people see before they message you."
          icon="UserRound"
        >
          <SettingsNavigationItem
            icon="UserRound"
            label="Edit profile"
            description="Photos, bio, basics, lifestyle, and visibility."
            onPress={() => router.navigate("/(subpage)/edit-profile")}
          />
          <SettingsNavigationItem
            icon="SlidersHorizontal"
            label="Edit preferences"
            description="Tune who you meet and what kind of connection you want."
            onPress={() => router.navigate("/(subpage)/edit-preference")}
          />
        </SettingsSection>

        <SettingsSection
          variant="card"
          title="Account"
          description="Keep your account details and app settings current."
          icon="ShieldCheck"
        >
          <SettingsNavigationItem
            icon="Settings"
            label="User settings"
            description="Update account, notification, and privacy settings."
            onPress={() => router.navigate("/(subpage)/edit-user-settings")}
          />
        </SettingsSection>

        <SettingsSection
          variant="card"
          title="Rewards"
          description="Track credits and invite people into Lumore."
          icon="Gift"
        >
          <SettingsNavigationItem
            icon="Wallet"
            label="Credits"
            description="View balance, earned credits, and credit history."
            onPress={() => router.navigate("/(subpage)/credits")}
          />
          <SettingsNavigationItem
            icon="Gift"
            label="Referral"
            description="Share Lumore and unlock referral rewards."
            onPress={() => router.navigate("/(subpage)/referral")}
          />
        </SettingsSection>

        <SettingsSection
          variant="card"
          title="Community"
          description="Play, reflect, and share feedback."
          icon="MessageCircleHeart"
        >
          <SettingsNavigationItem
            icon="Gamepad2"
            label="Games"
            description="Answer prompts and playful profile questions."
            onPress={() => router.navigate("/(subpage)/games")}
          />
          <SettingsNavigationItem
            icon="MessageCircleMore"
            label="Feedback"
            description="Read feedback and relationship notes people shared."
            onPress={() => router.navigate("/(subpage)/feedback")}
          />
        </SettingsSection>

        <SurfacePanel surface="paper" className="mt-5">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest/10">
              <Icon
                name={isVerified ? "BadgeCheck" : "BadgeAlert"}
                size={19}
                color={COLORS.forest}
              />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-ink">
                Verification
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                Verified profiles build trust and unlock referral rewards.
              </Text>
            </View>
          </View>
          {isVerified ? (
            <View className="mt-4 flex-row items-center gap-3 rounded-[22px] border border-ui-forest/20 bg-ui-forest/10 p-4">
              <Icon name="BadgeCheck" size={18} color={COLORS.forest} />
              <Text className="font-semibold text-ui-forest">
                Verified
              </Text>
            </View>
          ) : (
            <Button
              className="mt-4"
              text={
                isPending
                  ? "Continue verification"
                  : isProcessing
                    ? "Verification processing"
                  : isStartingVerification
                    ? "Opening verification..."
                    : "Verify myself"
              }
              disabled={isProcessing || isStartingVerification}
              onClick={handleStartVerification}
            />
          )}
        </SurfacePanel>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;
