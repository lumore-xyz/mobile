import PostEditSheetContent from "@/src/components/profile/PostEditSheetContent";
import type { ProfilePostEditCopy } from "@/src/domain/profile/getProfilePostEditCopy";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from "@/src/components/ui/actionsheet";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ProfilePostActionSheetsProps {
  actionSheetOpen: boolean;
  editSheetOpen: boolean;
  actionError: string;
  editError: string;
  editText: string;
  editVisibility: string;
  isUpdatingPost: boolean;
  editCopy: ProfilePostEditCopy;
  onCloseActions: () => void;
  onEditPost: () => void;
  onDeletePost: () => void;
  onCloseEdit: () => void;
  onChangeText: (value: string) => void;
  onChangeVisibility: (value: string) => void;
  onSave: () => void;
}

const ProfilePostActionSheets = ({
  actionSheetOpen,
  editSheetOpen,
  actionError,
  editError,
  editText,
  editVisibility,
  isUpdatingPost,
  editCopy,
  onCloseActions,
  onEditPost,
  onDeletePost,
  onCloseEdit,
  onChangeText,
  onChangeVisibility,
  onSave,
}: ProfilePostActionSheetsProps) => (
  <>
    <Actionsheet isOpen={actionSheetOpen} onClose={onCloseActions}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="p-0 pb-6">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <View className="w-full p-4">
          <Text className="mb-2 text-base font-semibold">Post actions</Text>
          <Pressable
            onPress={onEditPost}
            className="mb-3 min-h-12 w-full flex-row items-center gap-3 rounded-full bg-ui-forest/10 px-4 py-3 active:opacity-75"
            accessibilityRole="button"
            accessibilityLabel="Edit post"
          >
            <Icon name="Pencil" size={18} color={COLORS.forest} />
            <Text className="text-base font-semibold text-ui-forest">
              Edit post
            </Text>
          </Pressable>
          <Pressable
            onPress={onDeletePost}
            className="min-h-12 w-full flex-row items-center gap-3 rounded-2xl border border-ui-danger/25 bg-ui-danger/5 px-4 py-3 active:opacity-75"
            accessibilityRole="button"
            accessibilityLabel="Delete post"
          >
            <Icon name="Trash2" size={18} color={COLORS.danger} />
            <Text className="text-base font-medium text-ui-danger">
              Delete post
            </Text>
          </Pressable>
          {actionError ? (
            <Text className="mt-2 text-sm text-ui-danger">{actionError}</Text>
          ) : null}
        </View>
      </ActionsheetContent>
    </Actionsheet>
    <Actionsheet isOpen={editSheetOpen} onClose={onCloseEdit}>
      <ActionsheetBackdrop />
      <ActionsheetContent className="px-4 pb-6 pt-1">
        <ActionsheetDragIndicatorWrapper>
          <ActionsheetDragIndicator />
        </ActionsheetDragIndicatorWrapper>
        <PostEditSheetContent
          title={editCopy.title}
          label={editCopy.label}
          placeholder={editCopy.placeholder}
          helper={editCopy.helper}
          value={editText}
          visibility={editVisibility}
          error={editError}
          isSaving={isUpdatingPost}
          onChangeText={onChangeText}
          onChangeVisibility={onChangeVisibility}
          onCancel={onCloseEdit}
          onSave={onSave}
        />
      </ActionsheetContent>
    </Actionsheet>
  </>
);

export default ProfilePostActionSheets;
