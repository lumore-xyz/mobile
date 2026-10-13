import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import TextAreaInput from "@/src/components/ui/TextAreaInput";
import ChoiceChipGroup from "@/src/components/ui/ChoiceChipGroup";
import {
  chatFeedbackSchema,
  chatReportSchema,
} from "@/src/domain/chat/validation";
import { reportChatUser, submitChatFeedback } from "@/src/features/chat/api";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/src/utils/haptics";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

interface ChatSafetySheetProps {
  isOpen: boolean;
  roomId: string | null;
  onClose: () => void;
  onEndChat: () => void;
}

const REPORT_CATEGORIES = [
  { label: "Spam", value: "spam" },
  { label: "Harassment", value: "harassment" },
  { label: "Nudity", value: "nudity" },
  { label: "Hate Speech", value: "hate_speech" },
  { label: "Scam/Fraud", value: "scam_fraud" },
  { label: "Impersonation", value: "impersonation" },
  { label: "Underage", value: "underage" },
  { label: "Violence", value: "violence" },
  { label: "Threats", value: "threats" },
  { label: "Self-harm", value: "self_harm" },
  { label: "Bullying", value: "bullying" },
  { label: "Other", value: "other" },
];

const ChatSafetySheet = ({
  isOpen,
  roomId,
  onClose,
  onEndChat,
}: ChatSafetySheetProps) => {
  const [mode, setMode] = useState<"menu" | "feedback" | "report">("menu");
  const [feedbackText, setFeedbackText] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const closeSheet = () => {
    onClose();
    setMode("menu");
    setFeedbackText("");
    setReportText("");
    setReportCategory("");
    setErrorText("");
  };

  const handleSubmitFeedback = async () => {
    if (!roomId) return;
    const result = chatFeedbackSchema.safeParse(feedbackText);
    if (!result.success) {
      setErrorText(
        result.error.issues[0]?.message ||
          "Please check your feedback before ending the chat.",
      );
      return;
    }
    setIsSubmitting(true);
    setErrorText("");
    try {
      await submitChatFeedback(roomId, result.data);
      triggerSuccessHaptic();
      closeSheet();
      onEndChat();
    } catch {
      setErrorText("Unable to submit feedback right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportUser = async () => {
    if (!roomId) return;
    const result = chatReportSchema.safeParse({
      category: reportCategory,
      details: reportText,
    });
    if (!result.success) {
      setErrorText(
        result.error.issues[0]?.message ||
          "Please describe the issue before reporting.",
      );
      return;
    }
    setIsSubmitting(true);
    setErrorText("");
    try {
      await reportChatUser(
        roomId,
        result.data.category,
        "report_from_chat",
        result.data.details,
      );
      triggerSuccessHaptic();
      closeSheet();
    } catch {
      setErrorText("Unable to submit report right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Actionsheet isOpen={isOpen} onClose={closeSheet}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="p-0 pb-4">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <ScrollView
          className="w-full"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
            {mode === "menu" ? (
              <View className="w-full px-4 pb-4">
                <Text className="mb-3 text-lg font-semibold">Chat options</Text>
                <Pressable
                  onPress={() => {
                    triggerSelectionHaptic();
                    setMode("feedback");
                  }}
                  className="mb-2 min-h-12 w-full rounded-md border border-ui-ink/20 bg-ui-paper px-4 py-3"
                  accessibilityRole="button"
                >
                  <Text className="text-base font-medium">
                    End chat with feedback
                  </Text>
                  <Text className="text-xs text-ui-ink">
                    Feedback is optional, but helpful
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    triggerSelectionHaptic();
                    setMode("report");
                  }}
                  className="min-h-12 w-full rounded-md border border-ui-danger/25 bg-ui-danger/5 px-4 py-3"
                  accessibilityRole="button"
                >
                  <Text className="text-base font-medium text-ui-danger">
                    Report user
                  </Text>
                  <Text className="text-xs text-ui-danger">
                    Tell us what happened
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View className="w-full px-4 pb-4">
                <View className="mb-3 flex-row items-center justify-between">
                  <Pressable
                    onPress={() => {
                      triggerSelectionHaptic();
                      setMode("menu");
                    }}
                    className="min-h-11 justify-center"
                    hitSlop={8}
                    accessibilityRole="button"
                  >
                    <Text className="text-ui-ink">Back</Text>
                  </Pressable>
                  <Text className="text-lg font-semibold">
                    {mode === "feedback" ? "End chat" : "Report user"}
                  </Text>
                  <View className="w-10" />
                </View>

                {mode === "feedback" ? (
                  <TextAreaInput
                    label="Feedback"
                    value={feedbackText}
                    action={(value) => {
                      setFeedbackText(value);
                      setErrorText("");
                    }}
                    placeholder="What could they improve? (optional)"
                    helperText="Your feedback helps improve the community."
                  />
                ) : (
                  <>
                    <Text className="mb-2 text-sm font-medium text-ui-ink">
                      Category
                    </Text>
                    <View className="mb-3">
                      <ChoiceChipGroup
                        options={REPORT_CATEGORIES}
                        value={reportCategory}
                        size="compact"
                        onValueChange={(nextValue) => {
                          triggerSelectionHaptic();
                          setReportCategory(nextValue);
                          setErrorText("");
                        }}
                      />
                    </View>
                    <TextAreaInput
                      label="Report"
                      value={reportText}
                      action={(value) => {
                        setReportText(value);
                        setErrorText("");
                      }}
                      placeholder="Describe what happened..."
                      helperText="We review reports carefully."
                    />
                  </>
                )}

                {errorText ? (
                  <Text className="mt-2 text-sm text-ui-danger">
                    {errorText}
                  </Text>
                ) : null}

                <Pressable
                  disabled={isSubmitting}
                  onPress={
                    mode === "feedback"
                      ? handleSubmitFeedback
                      : handleReportUser
                  }
                  className={`mt-4 min-h-12 w-full rounded-md py-3 ${
                    mode === "feedback" ? "bg-ui-forest" : "bg-ui-danger"
                  } ${isSubmitting ? "opacity-70" : ""}`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isSubmitting }}
                >
                  <Text className="text-center font-semibold text-ui-paper">
                    {mode === "feedback" ? "Submit & End Chat" : "Report"}
                  </Text>
                </Pressable>
              </View>
            )}
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
};

export default ChatSafetySheet;
