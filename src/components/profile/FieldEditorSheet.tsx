import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import { validateSettingsField } from "@/src/lib/settingsValidators";
import Icon from "@/src/libs/Icon";
import { preferenceSchema } from "@/src/schemas/preferenceSchema";
import { createProfileSchema } from "@/src/schemas/profileSchema";
import { useUsernameAvailability } from "@/src/hooks/useUsernameAvailability";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";
import FieldEditorContent from "./FieldEditorContent";

interface FieldEditorSheetProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fieldType: string;
  onUpdate: (field: string, value: any) => Promise<void>;
  currentValue: any;
  isLoading: boolean;
  form: any;
  schemaType?: "profile" | "preferences" | "settings";
  currentUsername?: string;
}

const FieldEditorSheet: React.FC<FieldEditorSheetProps> = ({
  isOpen,
  setIsOpen,
  fieldType,
  onUpdate,
  currentValue,
  schemaType = "profile",
  currentUsername,
}) => {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState(currentValue);
  const [errorMessage, setErrorMessage] = useState("");
  const isUsernameField = schemaType === "profile" && fieldType === "username";
  const usernameAvailability = useUsernameAvailability({
    username: String(value || ""),
    currentUsername,
    enabled: isOpen && isUsernameField,
  });
  const isSubmitDisabled =
    isUsernameField &&
    (usernameAvailability.isChecking || !usernameAvailability.canSubmit);
  const safeFieldType = fieldType || "";
  const formattedFieldType = safeFieldType
    .replace(/([A-Z])/g, " $1")
    .replace(/\./g, " ")
    .trim();

  useEffect(() => {
    if (isOpen) {
      setValue(currentValue);
      setErrorMessage("");
    }
  }, [currentValue, fieldType, isOpen]);

  const handleValueChange = (nextValue: any) => {
    setValue(nextValue);
    setErrorMessage("");
  };

  const getFieldSchema = (schema: any, fieldPath: string) => {
    return fieldPath.split(".").reduce((acc, key) => acc?.shape?.[key], schema);
  };

  const validateField = async () => {
    if (!fieldType) return;

    if (schemaType === "settings") {
      const message = validateSettingsField(fieldType, String(value ?? ""));
      if (message) {
        throw new Error(message);
      }
      return;
    }

    const schema =
      schemaType === "preferences"
        ? preferenceSchema
        : createProfileSchema(currentUsername);
    const fieldSchema = getFieldSchema(schema, fieldType);
    if (!fieldSchema) {
      throw new Error(`No schema found for field: ${fieldType}`);
    }
    await fieldSchema.parseAsync(value);
  };

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      setErrorMessage(
        usernameAvailability.message || "Please choose an available username.",
      );
      return;
    }

    try {
      setErrorMessage("");
      await validateField();
      await onUpdate(fieldType, value);
      setIsOpen(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrorMessage(error.issues[0]?.message || "Invalid value");
        return;
      }

      if (error instanceof Error) {
        setErrorMessage(
          error.message || "Unable to update this field. Please try again.",
        );
        return;
      }

      setErrorMessage("Unable to update this field. Please try again.");
    }
  };

  const handleCancel = () => {
    setValue(currentValue);
    setErrorMessage("");
    setIsOpen(false);
  };

  const handleCancelPress = () => {
    triggerSelectionHaptic();
    handleCancel();
  };

  const handleSubmitPress = () => {
    if (isSubmitDisabled) return;
    triggerSelectionHaptic();
    void handleSubmit();
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={handleCancel}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="min-h-[88%] flex-col rounded-t-[32px] bg-ui-surface-page p-0">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View className="w-full flex-1">
          <View className="w-full px-4 pb-3">
            <View className="flex-row items-center justify-between gap-4 rounded-[28px] bg-ui-foreground p-4">
              <Pressable
              onPress={handleCancelPress}
              className="h-11 w-11 items-center justify-center rounded-full bg-ui-light/10 active:opacity-75"
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel="Cancel edit"
            >
              <Icon
                name="X"
                size={22}
                className="text-ui-light"
              />
              </Pressable>

              <View className="flex-1">
                <Text className="text-xs font-semibold text-ui-light/60">
                  Editing profile
                </Text>
                <Text className="mt-1 capitalize text-2xl font-bold leading-7 text-ui-light">
                  {formattedFieldType || "Field"}
                </Text>
                <Text className="mt-1 text-sm leading-5 text-ui-light/70">
                  Keep it honest, specific, and easy to reply to.
                </Text>
              </View>

              <Pressable
                onPress={handleSubmitPress}
                disabled={isSubmitDisabled}
                className={`h-11 w-11 items-center justify-center rounded-full bg-ui-primary ${
                  isSubmitDisabled ? "opacity-40" : "active:opacity-80"
                }`}
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel="Save edit"
                accessibilityState={{ disabled: isSubmitDisabled }}
              >
                <Icon
                  name="Check"
                  size={22}
                  className="text-ui-shade"
                />
              </Pressable>
            </View>
          </View>

          <ScrollView
            className="w-full flex-1 px-4"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            <View className="rounded-[28px] border border-ui-border bg-ui-light p-4">
              {safeFieldType ? (
                <FieldEditorContent
                  fieldType={safeFieldType}
                  value={value}
                  setValue={handleValueChange}
                  usernameAvailability={
                    isUsernameField ? usernameAvailability : undefined
                  }
                />
              ) : null}
              {errorMessage ? (
                <View className="mt-4 rounded-2xl bg-red-50 p-3">
                  <Text className="text-sm font-medium text-red-600">
                    {errorMessage}
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default FieldEditorSheet;
