import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import FieldEditorSheet from "../components/profile/FieldEditorSheet";
import ProfileField from "../components/profile/ProfileField";
import Button from "../components/ui/Button";
import { useUser } from "../hooks/useUser";
import { deleteAccount, updateUserData } from "../libs/apis";
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
  password?: string; // Optional for password updates
}

const EditUserSettingsScreen = () => {
  const { logout } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const _user = getUser();
  const userId = _user?._id;
  const { user, isUpdating } = useUser(
    userId
  ) as any;

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

  const handleFieldUpdate = async (field: keyof UserSettings, value: any) => {
    try {
      let updateData: any = {};

      if (field === "web3Wallet") {
        updateData = {
          web3Wallet: {
            addresses: Array.isArray(value) ? value : [value],
          },
        };
      } else {
        updateData = { [field]: value };
      }

      await updateUserData(updateData);

      setSettings((prev) => ({
        ...prev,
        ...updateData,
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
        onUpdate={handleFieldUpdate as any}
        currentValue={
          editFieldType === "web3Wallet"
            ? settings.web3Wallet.addresses[0]
            : editFieldType
            ? (settings[editFieldType as keyof typeof settings] ?? null)
            : null
        }
        isLoading={isUpdating}
        form={settings as UserSettings}
        schemaType="settings"
      />

      <ScrollView
        ref={scrollRef}
        className="px-4"
        contentContainerClassName="pb-10 pt-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View className="mb-5 overflow-hidden rounded-[32px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                className="text-[28px] font-bold leading-8 text-ui-light"
                accessibilityRole="header"
              >
                Account controls
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-light/70">
                Keep your contact details, wallet, and account access safe.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="ShieldCheck" size={20} color={COLORS.shade} />
            </View>
          </View>
        </View>

        <SettingsPanel
          title="Contact"
          description="These details help secure your account and keep you reachable."
          icon="AtSign"
        >
          <ProfileField
            label="Email"
            field="email"
            value={user?.email}
            onEdit={() => handleEditField("email")}
          />
          <ProfileField
            label="Phone Number"
            field="phoneNumber"
            value={user?.phoneNumber}
            onEdit={() => handleEditField("phoneNumber")}
          />
        </SettingsPanel>

        <SettingsPanel
          title="Wallet"
          description="Connect a wallet if you want to use Web3-linked rewards later."
          icon="Wallet"
        >
          <ProfileField
            label="Web3 Wallet"
            field="web3Wallet"
            value={settings.web3Wallet.addresses[0]}
            onEdit={() => handleEditField("web3Wallet")}
          />
        </SettingsPanel>

        <View className="mt-5 rounded-[28px] border border-ui-border bg-ui-light p-5">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-highlight/10">
              <Icon name="LogOut" size={19} color={COLORS.highlight} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-shade">
                Session
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">
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
        </View>

        <View className="mt-5 rounded-[28px] border border-red-200 bg-red-50 p-5">
          <View className="flex-row items-start gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-red-100">
              <Icon name="TriangleAlert" size={19} color={COLORS.danger} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-red-700">
                Danger zone
              </Text>
              <Text className="mt-1 text-sm leading-5 text-red-700/80">
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

const SettingsPanel = ({
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

export default EditUserSettingsScreen;
