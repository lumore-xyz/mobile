import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import TextAreaInput from "@/src/components/ui/TextAreaInput";
import ChoiceChipGroup from "@/src/components/ui/ChoiceChipGroup";
import { RejectExploreProfileInput } from "@/src/features/explore/api";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/src/utils/haptics";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";

const REJECTION_REASONS = [
  { label: "Not my type", value: "not_my_type" },
  { label: "Different intentions", value: "different_intentions" },
  { label: "Too far away", value: "too_far_away" },
  { label: "Profile feels incomplete", value: "profile_incomplete" },
  { label: "Something else", value: "other" },
] as const;

export default function RejectProfileSheet({
  isOpen,
  name,
  submitting,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  name: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (input: RejectExploreProfileInput) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const close = () => {
    if (submitting) return;
    setReason("");
    setFeedback("");
    setError("");
    onClose();
  };

  const submit = async () => {
    if (!reason) {
      setError("Choose a reason before removing this suggestion.");
      return;
    }
    try {
      await onSubmit({ reason, feedback: feedback.trim() || undefined });
      triggerSuccessHaptic();
      close();
    } catch {
      // The request hook owns the user-facing network error.
    }
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={close}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="p-0">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ScrollView
          className="w-full"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
          }}
        >
          <View className="mb-5 flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-2xl font-semibold text-ui-midnight">
                Remove {name}?
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                They will disappear from Explore. Your feedback stays private.
              </Text>
            </View>
            <Pressable
              onPress={close}
              disabled={submitting}
              className="h-11 w-11 items-center justify-center rounded-full bg-ui-surface-page active:opacity-70"
              accessibilityRole="button"
              accessibilityLabel="Close rejection feedback"
            >
              <Icon name="X" size={20} color={COLORS.midnight} />
            </Pressable>
          </View>

          <Text className="mb-3 text-base font-bold text-ui-ink">
            What was not a fit?
          </Text>
          <View className="mb-5">
            <ChoiceChipGroup
              options={REJECTION_REASONS}
              value={reason}
              isDisabled={submitting}
              onValueChange={(nextValue) => {
                triggerSelectionHaptic();
                setReason(nextValue);
                setError("");
              }}
            />
          </View>

          <TextAreaInput
            label="Anything else?"
            value={feedback}
            action={(value) => {
              setFeedback(value.slice(0, 500));
              setError("");
            }}
            placeholder="Optional feedback"
            helperText={`${feedback.length}/500 · Shared only with Lumore`}
            isDisabled={submitting}
          />

          {error ? (
            <Text
              className="mt-3 text-sm font-semibold text-ui-danger"
              accessibilityRole="alert"
            >
              {error}
            </Text>
          ) : null}

          <Pressable
            onPress={() => void submit()}
            disabled={submitting}
            className={`mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-danger px-5 py-3 active:opacity-80 ${submitting ? "opacity-50" : ""}`}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${name} from Explore`}
            accessibilityState={{ disabled: submitting }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.paper} />
            ) : (
              <Icon name="UserRoundX" size={19} color={COLORS.paper} />
            )}
            <Text className="font-bold text-ui-paper">
              {submitting ? "Removing..." : "Remove from Explore"}
            </Text>
          </Pressable>
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
}

