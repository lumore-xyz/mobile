import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import { useUser } from "../hooks/useUser";
import { startDiditVerification } from "../libs/apis";
import { getUser } from "../service/storage";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

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
    <View className="flex-1 bg-ui-light">
      <SubPageBack title="Settings" fallbackHref="/profile" />
      <ScrollView className="p-4" contentContainerClassName="pb-10">
        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-base font-semibold">Profile</Text>
          <SettingsItem
            icon="person-outline"
            label="Edit profile"
            onPress={() => router.navigate("/(subpage)/edit-profile")}
          />
          <SettingsItem
            icon="options-outline"
            label="Edit preferences"
            onPress={() => router.navigate("/(subpage)/edit-preference")}
          />
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4 mt-4">
          <Text className="text-base font-semibold">Account</Text>
          <SettingsItem
            icon="settings-outline"
            label="User settings"
            onPress={() => router.navigate("/(subpage)/edit-user-settings")}
          />
          <SettingsItem
            icon="key-outline"
            label="Set new password"
            onPress={() => router.navigate("/set-new-password")}
          />
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4 mt-4">
          <Text className="text-base font-semibold">Rewards</Text>
          <SettingsItem
            icon="cash-outline"
            label="Credits"
            onPress={() => router.navigate("/(subpage)/credits")}
          />
          <SettingsItem
            icon="gift-outline"
            label="Referral"
            onPress={() => router.navigate("/(subpage)/referral")}
          />
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4 mt-4">
          <Text className="text-base font-semibold">Community</Text>
          <SettingsItem
            icon="game-controller-outline"
            label="Games"
            onPress={() => router.navigate("/(subpage)/games")}
          />
          <SettingsItem
            icon="chatbox-ellipses-outline"
            label="Feedback"
            onPress={() => router.navigate("/(subpage)/feedback")}
          />
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4 mt-4">
          <Text className="text-base font-semibold">Verification</Text>
          <Text className="text-xs text-ui-shade mt-1">
            Verified profiles get access to referral rewards.
          </Text>
          {isVerified ? (
            <View className="mt-3 rounded-xl bg-ui-highlight/10 border border-ui-highlight/20 p-3">
              <Text className="text-ui-highlight font-medium">Verified</Text>
            </View>
          ) : (
            <Button
              className="mt-3"
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
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <Pressable
    onPress={onPress}
    className="mt-3 flex-row items-center justify-between rounded-xl border border-ui-shade/10 px-4 py-3"
  >
    <View className="flex-row items-center gap-3">
      <Ionicons name={icon} size={18} className="text-ui-shade" />
      <Text className="text-ui-shade font-medium">{label}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} className="text-ui-shade/60" />
  </Pressable>
);

export default SettingsScreen;

