import SurfacePanel from "@/src/components/ui/SurfacePanel";
import SubPageBack from "@/src/components/headers/SubPageBack";
import EditProfileSkeleton from "@/src/components/profile/EditProfileSkeleton";
import { useMediaPermisions } from "@/src/hooks/useMediaPermision";
import { useUser } from "@/src/hooks/useUser";
import { uploadProfilePicture } from "@/src/features/profile/api";
import { getEditableProfileValue } from "@/src/features/profile/getEditableProfileValue";
import invalidateUserProfileQueries from "@/src/features/profile/invalidateUserProfileQueries";
import getProfileCompletion from "@/src/domain/profile/getProfileCompletion";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { toUserFacingError } from "@/src/utils/userFacingError";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";
import type { ImagePickerAsset } from "expo-image-picker";
import React, { useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import FieldEditorSheet from "../components/profile/FieldEditorSheet";
import ProfileFieldsList from "../components/profile/ProfileFieldsList";
import ProfileImagePicker from "../components/profile/ProfileImagePicker";

const EditProfileScreen = () => {
  const _user = getUser();
  const userId = _user?._id;
  const { user, updateVisibility, updateField, isLoading } =
    useUser(userId);

  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [editFieldType, setEditFieldType] = useState("");

  const scrollRef = useRef<ScrollView>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { pickImageAsync, selectedImage } = useMediaPermisions();

  const { profileCompletion: completionPercent, profileMissingCount: missingCount } =
    getProfileCompletion(user);

  const handleEditField = (field: string) => {
    setEditFieldType(field);
    setIsEditFieldOpen(true);
  };

  const handleVisibilityChange = async (field: string, visibility: string) => {
    try {
      await updateVisibility({ field, visibility });
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };

  const handleFieldUpdate = async (field: string, value: unknown) => {
    try {
      await updateField({ field, value });
      setIsEditFieldOpen(false);
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const handlePickImage = async () => {
    await pickImageAsync(async (asset: ImagePickerAsset) => {
      setIsUploadingImage(true);
      try {
        const response = await uploadProfilePicture({
          uri: asset.uri,
          name: asset.fileName || `profile-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        });
        setUploadedImage(response?.profilePicture || null);
        await invalidateUserProfileQueries(queryClient, userId);
      } catch (error: unknown) {
        setUploadedImage(null);
        Alert.alert(
          "Upload failed",
          toUserFacingError(
            error,
            "We couldn’t upload that photo. Please try again.",
          ),
        );
      } finally {
        setIsUploadingImage(false);
      }
    });
  };

  if (isLoading && !user) {
    return (
      <View className="flex-1 bg-ui-surface-page">
        <SubPageBack title="Edit Profile" />
        <ScrollView className="px-4" contentContainerClassName="pb-8 pt-4">
          <EditProfileSkeleton />
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Edit Profile" />

      <FieldEditorSheet
        key={editFieldType}
        isOpen={isEditFieldOpen}
        setIsOpen={setIsEditFieldOpen}
        fieldType={editFieldType}
        onUpdate={handleFieldUpdate}
        currentValue={getEditableProfileValue(user, editFieldType)}
        schemaType="profile"
        currentUsername={user?.username}
      />

      <ScrollView
        ref={scrollRef}
        className="px-4"
        contentContainerClassName="pb-10 pt-4"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <SurfacePanel surface="midnight" className="mb-5 overflow-hidden">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                className="text-[28px] font-bold leading-8 text-ui-paper"
                accessibilityRole="header"
              >
                Make your profile feel like you
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-paper/70">
                Add the details that make it easy for someone to start a real
                conversation.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="Sparkles" size={20} color={COLORS.ink} />
            </View>
          </View>
        </SurfacePanel>

        <ProfileImagePicker
          selectedImage={
            isUploadingImage ? selectedImage : (uploadedImage ?? undefined)
          }
          profilePicture={user?.profilePicture}
          onPickImage={handlePickImage}
          isUploading={isUploadingImage}
        />

        <SurfacePanel surface="paper" className="mt-4">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-ink">
                Profile strength
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                Complete profiles give better matches more ways to connect.
              </Text>
            </View>
            <View className="min-h-11 min-w-14 items-center justify-center rounded-2xl bg-ui-forest px-3">
              <Text className="font-bold text-ui-paper">
                {completionPercent}%
              </Text>
            </View>
          </View>
          <View className="mt-4 h-2.5 w-full rounded-full bg-ui-forest/10">
            <View
              className="h-2.5 rounded-full bg-ui-forest"
              style={{ width: `${completionPercent}%` }}
            />
          </View>
          {missingCount > 0 ? (
            <Text className="mt-3 text-sm leading-5 text-ui-slate">
              Add {missingCount} more details to reach 100%.
            </Text>
          ) : (
            <Text className="mt-3 text-sm leading-5 text-ui-slate">
              Great job! Your profile is complete.
            </Text>
          )}
        </SurfacePanel>

        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => handleEditField("bio")}
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-4 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Edit your bio"
          >
            <Icon name="PenLine" size={17} color={COLORS.paper} />
            <Text className="font-semibold text-ui-paper">Edit bio</Text>
          </Pressable>
          <Pressable
            onPress={() => handleEditField("interests")}
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-ui-forest/25 bg-ui-paper px-4 active:bg-ui-forest/5"
            accessibilityRole="button"
            accessibilityLabel="Edit interests"
          >
            <Icon name="Heart" size={17} color={COLORS.forest} />
            <Text className="font-semibold text-ui-forest">Interests</Text>
          </Pressable>
        </View>

        <ProfileFieldsList
          user={user}
          onEdit={handleEditField}
          onVisibilityChange={handleVisibilityChange}
        />
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;
