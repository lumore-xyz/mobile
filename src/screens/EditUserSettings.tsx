import SurfacePanel from "@/src/components/ui/SurfacePanel";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import AccountSettingRow from "@/src/components/settings/AccountSettingRow";
import SettingsSection from "@/src/components/settings/SettingsSection";
import SubPageBack from "../components/headers/SubPageBack";
import FieldEditorSheet from "../components/profile/FieldEditorSheet";
import Button from "../components/ui/Button";
import { useUser } from "../hooks/useUser";
import { deleteAccount, updateUserData } from "@/src/features/profile/api";
import { COLORS } from "../libs/constants/theme";
import Icon from "../libs/Icon";
import useAuth from "../service/requests/auth";
import { getUser } from "../service/storage";
import { triggerSelectionHaptic } from "../utils/haptics";

interface UserSettings {
  email: string;
  phoneNumber: string;
  web3Wallet: {
    addresses: string[];
  };
}

type UserSettingsUpdate = Partial<Pick<UserSettings, "email" | "phoneNumber">> & {
  web3Wallet?: UserSettings["web3Wallet"];
};

const EditUserSettingsScreen = () => {
  const { logout } = useAuth();
  const currentUser = getUser();
  const userId = currentUser?._id;
  const { user } = useUser(userId);

  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [editFieldType, setEditFieldType] = useState("");
  const [settings, setSettings] = useState<UserSettings>({
    email: "",
    phoneNumber: "",
    web3Wallet: {
      addresses: [],
    },
  });

  useEffect(() => {
    if (user) {
      setSettings({
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        web3Wallet: {
          addresses: user.web3Wallet?.addresses || [],
        },
      });
    }
  }, [user]);

  const handleEditField = (field: keyof UserSettings) => {
    triggerSelectionHaptic();
    setEditFieldType(field);
    setIsEditFieldOpen(true);
  };

  const handleFieldUpdate = async (field: string, value: unknown) => {
    try {
      let updateData: UserSettingsUpdate;
      if (field === "web3Wallet") {
        updateData = {
          web3Wallet: {
            addresses: Array.isArray(value) ? value.map(String) : [String(value ?? "")],
          },
        };
      } else if (field === "email" || field === "phoneNumber") {
        updateData = { [field]: value };
      } else {
        return;
      }

      await updateUserData(updateData);

      setSettings((prev) => ({
        ...prev,
        email: updateData.email ?? prev.email,
        phoneNumber: updateData.phoneNumber ?? prev.phoneNumber,
        web3Wallet: updateData.web3Wallet ?? prev.web3Wallet,
      }));

      setIsEditFieldOpen(false);
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const openAccountDeletionAlert = () => {
    triggerSelectionHaptic();
    Alert.alert(
      "Confirmation required",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: () => {
            handleDeleteAccount();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      await logout();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="User Settings" fallbackHref="/(subpage)/settings" />
      <FieldEditorSheet
        key={editFieldType}
        isOpen={isEditFieldOpen}
        setIsOpen={setIsEditFieldOpen}
        fieldType={editFieldType}
        onUpdate={handleFieldUpdate}
        currentValue={
          editFieldType === "web3Wallet"
            ? settings.web3Wallet.addresses[0]
            : editFieldType
            ? (settings[editFieldType as keyof typeof settings] ?? null)
            : null
        }
        schemaType="settings"
      />

      <ScrollView
        className="px-4"
        contentContainerClassName="pb-10 pt-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <SurfacePanel surface="midnight" className="mb-5 overflow-hidden">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                className="text-[28px] font-bold leading-8 text-ui-paper"
                accessibilityRole="header"
              >
                Account controls
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-paper/70">
                Keep your contact details, wallet, and account access safe.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="ShieldCheck" size={20} color={COLORS.ink} />
            </View>
          </View>
        </SurfacePanel>

        <SettingsSection
          title="Contact"
          description="These details help secure your account and keep you reachable."
          icon="AtSign"
        >
          <AccountSettingRow
            label="Email"
            value={user?.email}
            onEdit={() => handleEditField("email")}
          />
          <AccountSettingRow
            label="Phone Number"
            value={user?.phoneNumber}
            onEdit={() => handleEditField("phoneNumber")}
          />
        </SettingsSection>

        <SettingsSection
          title="Wallet"
          description="Connect a wallet if you want to use Web3-linked rewards later."
          icon="Wallet"
        >
          <AccountSettingRow
            label="Web3 Wallet"
            value={settings.web3Wallet.addresses[0]}
            onEdit={() => handleEditField("web3Wallet")}
          />
        </SettingsSection>

        <SurfacePanel surface="paper" className="mt-5">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest/10">
              <Icon name="LogOut" size={19} color={COLORS.forest} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-ink">
                Session
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                Sign out from this device when you need a clean break.
              </Text>
            </View>
          </View>
          <Button
            variant="outline"
            text="Logout"
            onClick={() => {
              triggerSelectionHaptic();
              logout();
            }}
            className="mt-4"
          />
        </SurfacePanel>

        <View className="mt-5 rounded-[24px] border border-ui-danger/25 bg-ui-danger/5 p-5">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-danger/10">
              <Icon name="TriangleAlert" size={19} color={COLORS.danger} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-danger">
                Danger zone
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-danger/80">
                Deleting your account is permanent and cannot be undone.
              </Text>
            </View>
          </View>
          <Button
            variant="danger"
            text="Delete Account"
            onClick={openAccountDeletionAlert}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default EditUserSettingsScreen;
