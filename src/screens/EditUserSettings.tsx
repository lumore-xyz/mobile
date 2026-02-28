import React, { useEffect, useRef, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";
import FieldEditorSheet from "../components/profile/FieldEditorSheet";
import ProfileField from "../components/profile/ProfileField";
import Button from "../components/ui/Button";
import { useUser } from "../hooks/useUser";
import { deleteAccount, updateUserData } from "../libs/apis";
import useAuth from "../service/requests/auth";
import { getUser } from "../service/storage";

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

  const openAccountDeleationAlert = () => {
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
    <View className="flex-1 bg-white">
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

      <ScrollView ref={scrollRef} className="p-4">
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
        <ProfileField
          label="web3 Wallets"
          field="web3Wallet"
          value={settings.web3Wallet.addresses[0] || "Not set"}
          onEdit={() => handleEditField("web3Wallet")}
        />

        <Button
          variant="outline"
          text="Logout"
          onClick={logout}
          className="mt-4"
        />
        <Button
          variant="danger"
          text="Delete Account"
          onClick={openAccountDeleationAlert}
          className="mt-4"
        />
      </ScrollView>
    </View>
  );
};

export default EditUserSettingsScreen;
