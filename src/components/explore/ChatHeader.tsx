import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import { TextAreaInput } from "@/src/components/ui/TextInput";
import {
  chatFeedbackSchema,
  chatReportSchema,
} from "@/src/domain/chat/validation";
import { reportChatUser, submitChatFeedback } from "@/src/libs/apis";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { useChat } from "@/src/service/context/ChatContext";
import { calculateAge } from "@/src/utils";
import {
  triggerSelectionHaptic,
  triggerSuccessHaptic,
} from "@/src/utils/haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ChatHeaderProps {
  user: any;
  onEndChat: () => void;
  currentUserId: string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  onEndChat,
  currentUserId,
}) => {
  const {
    roomId,
    matchedUser,
    lockProfile,
    unlockProfile,
    isActive,
    roomData,
  } = useChat();
  const insets = useSafeAreaInsets();
  const isRoomMatch = roomData?.source === "location_room";
  const roomMatchTitle =
    roomData?.sourceMetadata?.title ||
    roomData?.locationRoom?.title ||
    "Community";

  const [isUnlocked, setisUnlocked] = useState(
    user?.isViewerUnlockedUser || false,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"menu" | "feedback" | "report">(
    "menu",
  );
  const [feedbackText, setFeedbackText] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportCategory, setReportCategory] = useState<string>("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUnlockProfile = async () => {
    if (!roomId || !currentUserId || !matchedUser) return;
    triggerSelectionHaptic();
    setisUnlocked(true);
    unlockProfile(matchedUser?._id);
  };

  const handleLockProfile = async () => {
    if (!roomId || !currentUserId || !matchedUser) return;
    triggerSelectionHaptic();
    setisUnlocked(false);
    lockProfile(matchedUser?._id);
  };

  const navigateBack = () => {
    triggerSelectionHaptic();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/chat");
    }
  };

  const navigateToProfile = () => {
    if (!user?._id) return;
    triggerSelectionHaptic();
    router.push(`/profile/${user._id}`);
  };

  const openSheet = () => {
    triggerSelectionHaptic();
    setErrorText("");
    setSheetMode("menu");
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSheetMode("menu");
    setFeedbackText("");
    setReportText("");
    setReportCategory("");
    setErrorText("");
  };

  const handleSubmitFeedback = async () => {
    if (!roomId) return;
    const feedbackResult = chatFeedbackSchema.safeParse(feedbackText);
    if (!feedbackResult.success) {
      setErrorText(
        feedbackResult.error.issues[0]?.message ||
          "Please check your feedback before ending the chat.",
      );
      return;
    }
    setIsSubmitting(true);
    setErrorText("");
    try {
      await submitChatFeedback(roomId, feedbackResult.data);
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
    const reportResult = chatReportSchema.safeParse({
      category: reportCategory,
      details: reportText,
    });
    if (!reportResult.success) {
      setErrorText(
        reportResult.error.issues[0]?.message ||
          "Please describe the issue before reporting.",
      );
      return;
    }
    setIsSubmitting(true);
    setErrorText("");
    try {
      await reportChatUser(
        roomId,
        reportResult.data.category,
        "report_from_chat",
        reportResult.data.details,
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
    <View className="w-full flex-row items-center justify-between border-b border-ui-border bg-ui-light px-2 py-2.5">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Pressable
          onPress={navigateBack}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-ui-highlight/5"
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Back to inbox"
        >
          <Icon
            name="ArrowLeft"
            size={24}
            className="cursor-pointer"
          />
        </Pressable>
        <View style={{ position: "relative" }}>
          <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-ui-background">
            {user?.profilePicture ? (
              <Image
                source={{
                  uri: user?.profilePicture,
                }}
                blurRadius={user?.isViewerUnlockedByUser ? 0 : 12}
                style={{
                  resizeMode: "cover",
                  width: "100%",
                  height: "100%",
                  borderRadius: 9999,
                }}
                accessible
                accessibilityLabel={`Profile photo of ${user?.realName || user?.nickname || user?.username}`}
              />
            ) : (
              <Text className="text-3xl text-ui-shade">
                {user?.realName
                  ? user.realName[0]
                  : user?.nickname
                    ? user.nickname[0]
                    : user?.username[0]}
              </Text>
            )}
          </View>

          <View
            style={{ position: "absolute", bottom: 0, right: 0 }}
            className="h-4 w-4 items-center justify-center rounded-full bg-ui-light"
          >
            <Icon
              name={
                user?.isViewerUnlockedByUser
                  ? "LockOpen"
                  : "Lock"
              }
              color={COLORS.muted}
              size={10}
            />
          </View>
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={navigateToProfile}
              className="min-w-0 flex-1 justify-center"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="View profile"
            >
              <Text className="text-lg font-bold text-ui-shade" numberOfLines={1}>
                {user?.realName || user?.nickname || user?.username}
              </Text>
            </Pressable>
            {isRoomMatch ? (
              <View className="self-start rounded-full bg-ui-highlight/10 px-2 py-0.5 mt-0.5">
                <Text className="text-xs font-semibold text-ui-highlight">
                  {roomMatchTitle}
                </Text>
              </View>
            ) : null}
          </View>
          <View className="mt-1 flex-row flex-wrap items-center gap-2">
            {user?.dob ? (
              <View className="flex flex-row items-center justify-center gap-1 flex-shrink-0">
                <Icon name="CakeSlice" size={12} className="flex-shrink-0" />
                <Text className="text-xs font-medium text-ui-muted">{calculateAge(user?.dob)}</Text>
              </View>
            ) : null}

            {user?.gender ? (
              <View className="flex flex-row items-center justify-center gap-1 flex-shrink-0">
                <Icon name="UserRound" size={12} />
                <Text className="text-xs font-medium capitalize text-ui-muted">{user?.gender}</Text>
              </View>
            ) : null}

            <View className="flex flex-row items-center justify-center gap-1 flex-shrink-0">
              <Icon name="Footprints" size={12} className="flex-shrink-0" />
              <Text className="text-xs font-medium text-ui-muted">{Number(user?.distance || 0).toFixed(1)} km</Text>
            </View>
          </View>
        </View>
      </View>
      <View className="ml-1 flex-row items-center gap-1">
        <Pressable
          onPress={isUnlocked ? handleLockProfile : handleUnlockProfile}
          className="h-11 w-11 items-center justify-center rounded-full bg-ui-highlight/5 active:opacity-70"
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={isUnlocked ? "Lock profile" : "Unlock profile"}
        >
          {isUnlocked ? (
            <Icon name="LockOpen" size={20} color={COLORS.highlight} />
          ) : (
            <Icon name="Lock" size={20} color={COLORS.highlight} />
          )}
        </Pressable>
        {isActive ? (
          <Pressable
            onPress={openSheet}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-ui-highlight/5"
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Open chat options"
          >
            <Icon name="EllipsisVertical" size={24} />
          </Pressable>
        ) : null}
      </View>
      <Actionsheet isOpen={isSheetOpen} onClose={closeSheet}>
        <ActionsheetBackdrop />
        <ActionsheetContent className="p-0 pb-4">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <View className="w-full flex-1">
            <ScrollView
              className="w-full"
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              contentContainerStyle={{
                paddingBottom: Math.max(insets.bottom, 16),
              }}
            >
              {sheetMode === "menu" ? (
                <View className="w-full px-4 pb-4">
                  <Text className="text-lg font-semibold mb-3">
                    Chat options
                  </Text>
                  <Pressable
                    onPress={() => {
                      triggerSelectionHaptic();
                      setSheetMode("feedback");
                    }}
                    className="mb-2 min-h-12 w-full rounded-md border border-ui-shade/20 bg-ui-light px-4 py-3"
                    accessibilityRole="button"
                  >
                    <Text className="text-base font-medium">
                      End chat with feedback
                    </Text>
                    <Text className="text-xs text-ui-shade">
                      Feedback is optional, but helpful
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      triggerSelectionHaptic();
                      setSheetMode("report");
                    }}
                    className="min-h-12 w-full rounded-md border border-red-200 bg-red-50 px-4 py-3"
                    accessibilityRole="button"
                  >
                    <Text className="text-base font-medium text-red-600">
                      Report user
                    </Text>
                    <Text className="text-xs text-red-500">
                      Tell us what happened
                    </Text>
                  </Pressable>
                </View>
              ) : (
                <View className="w-full px-4 pb-4">
                  <View className="flex-row items-center justify-between mb-3">
                    <Pressable
                      onPress={() => {
                        triggerSelectionHaptic();
                        setSheetMode("menu");
                      }}
                      className="min-h-11 justify-center"
                      hitSlop={8}
                      accessibilityRole="button"
                    >
                      <Text className="text-ui-shade">Back</Text>
                    </Pressable>
                    <Text className="text-lg font-semibold">
                      {sheetMode === "feedback" ? "End chat" : "Report user"}
                    </Text>
                    <View className="w-10" />
                  </View>

                  {sheetMode === "feedback" ? (
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
                      <Text className="text-sm font-medium text-ui-shade mb-2">
                        Category
                      </Text>
                      <View className="flex-row flex-wrap gap-2 mb-3">
                        {[
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
                        ].map((option) => (
                          <Pressable
                            key={option.value}
                            onPress={() => {
                              triggerSelectionHaptic();
                              setReportCategory(option.value);
                              setErrorText("");
                            }}
                            className={` rounded-full border px-3 py-2 ${
                              reportCategory === option.value
                                ? "bg-ui-highlight border-ui-highlight"
                                : "bg-white border-ui-shade/20"
                            }`}
                          >
                            <Text
                              className={`text-xs ${
                                reportCategory === option.value
                                  ? "text-white"
                                  : "text-ui-shade"
                              }`}
                            >
                              {option.label}
                            </Text>
                          </Pressable>
                        ))}
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
                    <Text className="text-red-500 text-sm mt-2">
                      {errorText}
                    </Text>
                  ) : null}

                  <Pressable
                    disabled={isSubmitting}
                    onPress={
                      sheetMode === "feedback"
                        ? handleSubmitFeedback
                        : handleReportUser
                    }
                    className={`mt-4 min-h-12 w-full rounded-md py-3 ${
                      sheetMode === "feedback"
                        ? "bg-ui-highlight"
                        : "bg-red-600"
                    } ${isSubmitting ? "opacity-70" : ""}`}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isSubmitting }}
                  >
                    <Text className="text-center text-white font-semibold">
                      {sheetMode === "feedback"
                        ? "Submit & End Chat"
                        : "Report"}
                    </Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </View>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};

export default ChatHeader;
