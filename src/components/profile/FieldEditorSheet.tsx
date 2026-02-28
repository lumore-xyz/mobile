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
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
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
  const [value, setValue] = useState(currentValue);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      setValue(currentValue);
      setErrorMessage("");
    }
  }, [currentValue, fieldType, isOpen]);

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
        setErrorMessage(error.message || "Unable to update this field. Please try again.");
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

  return (
    <Actionsheet isOpen={isOpen} onClose={handleCancel}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="flex flex-col p-0 min-h-[90%]">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <View className="flex flex-row items-center justify-between p-3 gap-4 shadow-sm w-full">
          <TouchableOpacity onPress={handleCancel}>
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

          <TouchableOpacity onPress={handleSubmit}>
            <Icon
              type="Ionicons"
              name="checkmark-outline"
              size={32}
              className="text-xl !text-ui-highlight"
            />
          </TouchableOpacity>
        </View>

        <ScrollView className="w-full flex-1 p-3">
          <View className="flex gap-2">
            <FieldEditorContent
              fieldType={fieldType}
              value={value}
              setValue={setValue}
            />
            {errorMessage ? (
              <Text className="text-red-500 text-sm mt-1">{errorMessage}</Text>
            ) : null}
          </View>
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default FieldEditorSheet;
