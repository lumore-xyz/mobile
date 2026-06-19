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
  TouchableOpacity,
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
      <ActionsheetContent className="flex flex-col p-0 min-h-[90%]">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View className="w-full flex-1">
          <View className="flex flex-row items-center justify-between p-3 gap-4 shadow-sm w-full">
            <TouchableOpacity
              onPress={handleCancelPress}
              className="h-11 w-11 items-center justify-center rounded-full"
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel="Cancel edit"
            >
              <Icon
                type="Ionicons"
                name="close-outline"
                size={32}
                className="text-xl text-ui-shade"
              />
            </TouchableOpacity>

            <View>
              <Text className="capitalize text-xl font-semibold">
                Edit {fieldType}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmitPress}
              disabled={isSubmitDisabled}
              className={`h-11 w-11 items-center justify-center rounded-full ${
                isSubmitDisabled ? "opacity-40" : ""
              }`}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel="Save edit"
              accessibilityState={{ disabled: isSubmitDisabled }}
            >
              <Icon
                type="Ionicons"
                name="checkmark-outline"
                size={32}
                className="text-xl !text-ui-highlight"
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="w-full flex-1 p-3"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 24),
            }}
          >
            <View className="flex gap-2">
              <FieldEditorContent
                fieldType={fieldType}
                value={value}
                setValue={handleValueChange}
                usernameAvailability={
                  isUsernameField ? usernameAvailability : undefined
                }
              />
              {errorMessage ? (
                <Text className="text-red-500 text-sm mt-1">
                  {errorMessage}
                </Text>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default FieldEditorSheet;
