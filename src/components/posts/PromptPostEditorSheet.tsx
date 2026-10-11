import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import Button from "@/src/components/ui/Button";
import TextAreaInput from "@/src/components/ui/TextAreaInput";
import VisibilityToggle from "@/src/components/VisibilityToggle";
import type { Prompt } from "@/src/domain/posts/types";
import React from "react";
import { Text, View } from "react-native";

interface PromptPostEditorSheetProps {
  isOpen: boolean;
  prompt: Prompt | null;
  value: string;
  visibility: string;
  errorText: string;
  isSubmitting: boolean;
  onValueChange: (value: string) => void;
  onVisibilityChange: (visibility: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function PromptPostEditorSheet({
  isOpen,
  prompt,
  value,
  visibility,
  errorText,
  isSubmitting,
  onValueChange,
  onVisibilityChange,
  onClose,
  onSubmit,
}: PromptPostEditorSheetProps) {
  const trimmedValue = value.trim();

  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="p-0 pb-6">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <View className="w-full px-4 pt-4">
          <Text className="mb-1 text-xl font-bold text-ui-ink">
            Answer prompt
          </Text>
          <Text className="mb-4 text-sm leading-5 text-ui-slate">
            {prompt?.text}
          </Text>

          <TextAreaInput
            label="Your answer"
            value={value}
            action={onValueChange}
            placeholder="Write your answer..."
          />
          <Text className="mt-2 text-xs text-ui-slate">
            {trimmedValue.length
              ? `${trimmedValue.length} characters`
              : "Keep it honest, specific, and easy to reply to."}
          </Text>

          <View className="mt-4 rounded-[24px] border border-ui-parchment bg-ui-ink/5 p-4">
            <Text className="mb-3 text-sm font-bold text-ui-ink">
              Visibility
            </Text>
            <VisibilityToggle
              field="promptPost"
              currentVisibility={visibility}
              onVisibilityChange={(_, nextVisibility) =>
                onVisibilityChange(nextVisibility)
              }
              className="w-full"
            />
          </View>

          {errorText ? (
            <View className="mt-3 rounded-2xl bg-ui-danger/5 px-4 py-3">
              <Text className="text-sm font-medium text-ui-danger">
                {errorText}
              </Text>
            </View>
          ) : null}

          <Button
            text={isSubmitting ? "Posting..." : "Post prompt"}
            disabled={isSubmitting || !trimmedValue}
            onClick={onSubmit}
            className="mt-4 rounded-full"
          />
        </View>
      </ActionsheetContent>
    </Actionsheet>
  );
}
