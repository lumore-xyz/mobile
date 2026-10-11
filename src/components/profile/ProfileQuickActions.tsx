import SurfacePanel from "@/src/components/ui/SurfacePanel";
import ActionPill from "@/src/components/profile/ActionPill";
import SectionHeading from "@/src/components/profile/SectionHeading";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ProfileQuickActionsProps {
  isVerified: boolean;
  verificationStatus?: string;
  isStartingVerification: boolean;
  onStartVerification: () => void;
}

const ProfileQuickActions = ({
  isVerified,
  verificationStatus,
  isStartingVerification,
  onStartVerification,
}: ProfileQuickActionsProps) => (
  <SurfacePanel surface="paper" className="mt-5">
    <SectionHeading
      title="Your space"
      subtitle="Shortcuts for everything around your profile"
    />
    <View className="mt-3 flex-row flex-wrap gap-2">
      <ActionPill
        label="Credits"
        icon="Wallet"
        onPress={() => router.navigate("/(subpage)/credits")}
      />
      <ActionPill
        label="Referral"
        icon="Gift"
        onPress={() => router.navigate("/(subpage)/referral")}
      />
      <ActionPill
        label="Games"
        icon="Gamepad2"
        onPress={() => router.navigate("/(subpage)/games")}
      />
      <ActionPill
        label="Feedback"
        icon="MessageCircleMore"
        onPress={() => router.navigate("/(subpage)/feedback")}
      />
      <ActionPill
        label="Settings"
        icon="Settings"
        onPress={() => router.navigate("/(subpage)/settings")}
      />
      <ActionPill
        label="Notifications"
        icon="Bell"
        onPress={() => router.navigate("/(subpage)/notifications")}
      />
    </View>
    {!isVerified ? (
      <Pressable
        onPress={onStartVerification}
        disabled={
          isStartingVerification || verificationStatus === "processing"
        }
        className={`mt-4 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl border border-ui-forest/30 bg-ui-forest/10 px-4 py-3 active:opacity-80 ${
          isStartingVerification || verificationStatus === "processing"
            ? "opacity-70"
            : ""
        }`}
        accessibilityRole="button"
        accessibilityLabel="Start identity verification"
        accessibilityState={{
          disabled:
            isStartingVerification || verificationStatus === "processing",
        }}
      >
        <Icon name="BadgeCheck" size={18} color={COLORS.forest} />
        <Text className="font-semibold text-ui-forest">
          {verificationStatus === "pending"
            ? "Continue verification"
            : verificationStatus === "processing"
              ? "Verification processing"
              : isStartingVerification
                ? "Opening verification..."
                : "Verify myself"}
        </Text>
      </Pressable>
    ) : null}
  </SurfacePanel>
);

export default ProfileQuickActions;
