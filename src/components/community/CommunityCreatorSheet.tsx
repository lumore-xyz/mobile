import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import CommunityCreatorActions from "@/src/components/community/CommunityCreatorActions";
import CommunityEditForm from "@/src/components/community/CommunityEditForm";
import type { LocationRoomSummary } from "@/src/features/community/types";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

interface CommunityCreatorSheetProps {
  isOpen: boolean;
  isEditing: boolean;
  room: LocationRoomSummary;
  editedTitle: string;
  setEditedTitle: (value: string) => void;
  editedDescription: string;
  setEditedDescription: (value: string) => void;
  editedTags: string[];
  setEditedTags: (value: string[]) => void;
  editedCoverImageUri: string;
  canSave: boolean;
  isSaving: boolean;
  isStartingMatch: boolean;
  onClose: () => void;
  onCancelEditing: () => void;
  onPickCoverImage: () => void;
  onSave: () => void;
  onStartEditing: () => void;
  onStartMatch: () => void;
}

export default function CommunityCreatorSheet({
  isOpen,
  isEditing,
  room,
  editedTitle,
  setEditedTitle,
  editedDescription,
  setEditedDescription,
  editedTags,
  setEditedTags,
  editedCoverImageUri,
  canSave,
  isSaving,
  isStartingMatch,
  onClose,
  onCancelEditing,
  onPickCoverImage,
  onSave,
  onStartEditing,
  onStartMatch,
}: CommunityCreatorSheetProps) {
  return (
    <Actionsheet isOpen={isOpen} onClose={onClose}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="bg-ui-surface-page p-0">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>

        <ScrollView
          className="w-full"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full px-4 pb-3">
            <View className="flex-row items-center gap-4 rounded-[24px] bg-ui-midnight p-4">
              <Pressable
                onPress={isEditing ? onCancelEditing : onClose}
                className="h-11 w-11 items-center justify-center rounded-full bg-ui-paper/10 active:opacity-75"
                hitSlop={4}
                accessibilityRole="button"
                accessibilityLabel={isEditing ? "Back" : "Close creator controls"}
              >
                <Icon
                  name={isEditing ? "ArrowLeft" : "X"}
                  size={22}
                  className="text-ui-paper"
                />
              </Pressable>

              <View className="flex-1">
                <Text className="text-xs font-semibold text-ui-paper/60">
                  {isEditing ? "Editing community" : "Creator controls"}
                </Text>
                <Text className="mt-1 text-2xl font-bold leading-7 text-ui-paper">
                  {isEditing ? room.title : "Shape this community"}
                </Text>
                <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
                  {isEditing
                    ? "Keep it honest, specific, and easy to join."
                    : "Edit details or run the next cycle before the countdown ends."}
                </Text>
              </View>

              {isEditing ? (
                <Pressable
                  onPress={onSave}
                  disabled={!canSave || isSaving}
                  className={`h-11 w-11 items-center justify-center rounded-full bg-ui-champagne ${!canSave || isSaving ? "opacity-40" : "active:opacity-80"}`}
                  hitSlop={4}
                  accessibilityRole="button"
                  accessibilityLabel="Save community changes"
                  accessibilityState={{ disabled: !canSave || isSaving }}
                >
                  <Icon name="Check" size={22} className="text-ui-ink" />
                </Pressable>
              ) : (
                <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-champagne">
                  <Icon name="Sparkles" size={20} className="text-ui-ink" />
                </View>
              )}
            </View>
          </View>

          <View className="w-full px-4 pb-4">
            {isEditing ? (
              <CommunityEditForm
                room={room}
                editedTitle={editedTitle}
                onTitleChange={setEditedTitle}
                editedDescription={editedDescription}
                onDescriptionChange={setEditedDescription}
                editedTags={editedTags}
                onTagsChange={setEditedTags}
                editedCoverImageUri={editedCoverImageUri}
                canSave={canSave}
                isSaving={isSaving}
                onPickCoverImage={onPickCoverImage}
                onSave={onSave}
                onCancel={onCancelEditing}
              />
            ) : (
              <CommunityCreatorActions
                isStartingMatch={isStartingMatch}
                onStartEditing={onStartEditing}
                onStartMatch={onStartMatch}
              />
            )}
          </View>
        </ScrollView>
      </ActionsheetContent>
    </Actionsheet>
  );
}
