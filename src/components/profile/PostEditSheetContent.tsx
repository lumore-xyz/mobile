import VisibilityToggle from "@/src/components/VisibilityToggle";
import TextAreaInput from "@/src/components/ui/TextAreaInput";
import React from "react";
import { Pressable, Text, View } from "react-native";

const PostEditSheetContent = ({
  title,
  label,
  placeholder,
  helper,
  value,
  visibility,
  error,
  isSaving,
  onChangeText,
  onChangeVisibility,
  onCancel,
  onSave,
}: {
  title: string;
  label: string;
  placeholder: string;
  helper?: string;
  value: string;
  visibility: string;
  error: string;
  isSaving: boolean;
  onChangeText: (value: string) => void;
  onChangeVisibility: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) => (
  <View className="w-full">
    <View className="mb-5 rounded-[26px] bg-ui-surface-page p-4">
      <Text
        className="text-xl font-bold leading-7 text-ui-ink"
        accessibilityRole="header"
      >
        {title}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-ui-slate">
        Update how this appears on your profile.
      </Text>
    </View>

    <View className="gap-4">
      <TextAreaInput
        label={label}
        value={value}
        action={onChangeText}
        placeholder={placeholder}
        helperText={helper}
        errorText={error}
        isDisabled={isSaving}
      />

      <View>
        <Text className="mb-2 text-sm font-semibold text-ui-ink">
          Visibility
        </Text>
        <VisibilityToggle
          field="profilePost"
          currentVisibility={visibility}
          onVisibilityChange={(_, nextVisibility) =>
            onChangeVisibility(nextVisibility)
          }
          className="w-full"
        />
      </View>
    </View>

    <View className="mt-6 flex-row gap-3">
      <Pressable
        onPress={onCancel}
        disabled={isSaving}
        className={`min-h-12 flex-1 items-center justify-center rounded-full border border-ui-parchment px-4 ${
          isSaving ? "opacity-60" : "active:opacity-75"
        }`}
        accessibilityRole="button"
        accessibilityLabel="Cancel editing post"
        accessibilityState={{ disabled: isSaving }}
      >
        <Text className="font-semibold text-ui-ink">Cancel</Text>
      </Pressable>
      <Pressable
        onPress={onSave}
        disabled={isSaving}
        className={`min-h-12 flex-1 items-center justify-center rounded-2xl bg-ui-forest px-4 ${
          isSaving ? "opacity-60" : "active:opacity-80"
        }`}
        accessibilityRole="button"
        accessibilityLabel="Save post changes"
        accessibilityState={{ disabled: isSaving }}
      >
        <Text className="font-semibold text-ui-paper">
          {isSaving ? "Saving..." : "Save changes"}
        </Text>
      </Pressable>
    </View>
  </View>
);

export default PostEditSheetContent;
