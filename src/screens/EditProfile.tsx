import SubPageBack from "@/src/components/headers/SubPageBack";
import { useNsfw } from "@/src/hooks/useNsfw";
import { useMediaPermisions } from "@/src/hooks/useMediaPermision";
import { useUser } from "@/src/hooks/useUser";
import { uploadProfilePicture } from "@/src/libs/apis";
import {
  ProfileFormValues,
  createProfileSchema,
} from "@/src/schemas/profileSchema";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ImagePickerAsset } from "expo-image-picker";
import React, { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, ScrollView, Text, View } from "react-native";

import FieldEditorSheet from "../components/profile/FieldEditorSheet";
import ProfileFieldsList from "../components/profile/ProfileFieldsList";
import ProfileImagePicker from "../components/profile/ProfileImagePicker";

const EditProfileScreen = () => {
  const _user = getUser();
  const userId = _user?._id;
  const { user, updateVisibility, updateField, isUpdating, isLoading } =
    useUser(userId) as any;

  const [isEditFieldOpen, setIsEditFieldOpen] = useState(false);
  const [editFieldType, setEditFieldType] = useState("");

  const formSchema = useMemo(
    () => createProfileSchema(user?.username),
    [user?.username],
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username,
      nickname: user?.nickname,
      realName: user?.realName,
      phoneNumber: user?.phoneNumber,
      bloodGroup: user?.bloodGroup,
      interests: user?.interests,
      bio: user?.bio,
      gender: user?.gender,
      religion: user?.religion,
      dob: user?.dob
        ? new Date(user.dob).toISOString().split("T")[0]
        : undefined,
      height: user?.height,
      hometown: user?.hometown,
      diet: user?.diet,
      zodiacSign: user?.zodiacSign,
      lifestyle: user?.lifestyle,
      work: user?.work,
      institution: user?.institution,
      maritalStatus: user?.maritalStatus,
      languages: user?.languages,
      personalityType: user?.personalityType,
    },
  });

  const scrollRef = useRef<ScrollView>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const { assertImageIsSafe } = useNsfw();
  const { pickImageAsync, selectedImage } = useMediaPermisions();

  const { completionPercent, missingCount } = useMemo(() => {
    if (!user) return { completionPercent: 0, missingCount: 0 };
    const fields = [
      user?.profilePicture,
      user?.bio,
      user?.gender,
      user?.dob,
      user?.interests?.length ? user?.interests : null,
      user?.height,
      user?.diet,
      user?.zodiacSign,
      user?.lifestyle?.drinking,
      user?.lifestyle?.smoking,
      user?.lifestyle?.pets,
      user?.work,
      user?.institution,
      user?.languages?.length ? user?.languages : null,
      user?.personalityType,
      user?.religion,
      user?.hometown,
    ];
    const filledCount = fields.filter((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== "";
    }).length;
    const total = fields.length;
    const percent = total ? Math.round((filledCount / total) * 100) : 0;
    return { completionPercent: percent, missingCount: total - filledCount };
  }, [user]);

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

  const handleFieldUpdate = async (field: string, value: any) => {
    try {
      await updateField({ field, value });
      form.setValue(field as any, value);
      setIsEditFieldOpen(false);
    } catch (error) {
      console.error("Error updating field:", error);
    }
  };

  const handlePickImage = async () => {
    await pickImageAsync(async (asset: ImagePickerAsset) => {
      setIsUploadingImage(true);
      try {
        await assertImageIsSafe(asset.uri);

        const response = await uploadProfilePicture({
          uri: asset.uri,
          name: asset.fileName || `profile-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        });
        setUploadedImage(response?.profilePicture || null);
        await queryClient.invalidateQueries({ queryKey: ["user", userId] });
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          (error instanceof Error ? error.message : null) ||
          "Image upload failed. Please try again.";
        setUploadedImage(null);
        Alert.alert("Upload failed", message);
      } finally {
        setIsUploadingImage(false);
      }
    });
  };

  return (
    <View className="flex-1 bg-white">
      <SubPageBack title="Edit Profile" />

      <FieldEditorSheet
        key={editFieldType}
        isOpen={isEditFieldOpen}
        setIsOpen={setIsEditFieldOpen}
        fieldType={editFieldType}
        onUpdate={handleFieldUpdate}
        currentValue={form.getValues(editFieldType as any)}
        isLoading={isUpdating}
        form={form}
        schemaType="profile"
        currentUsername={user?.username}
      />

      <ScrollView
        ref={scrollRef}
        className="p-4"
        contentContainerClassName="pb-8"
      >
        {isLoading ? (
          <View className="py-6">
            <Text className="text-ui-shade">Loading profile...</Text>
          </View>
        ) : null}

        <ProfileImagePicker
          selectedImage={
            isUploadingImage ? selectedImage : (uploadedImage ?? undefined)
          }
          profilePicture={user?.profilePicture}
          onPickImage={handlePickImage}
          isUploading={isUploadingImage}
        />

        <View className="mt-4 p-4 rounded-2xl bg-ui-light border border-ui-shade/10">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-semibold">
              Profile completeness
            </Text>
            <Text className="text-sm text-ui-shade">{completionPercent}%</Text>
          </View>
          <View className="mt-2 h-2 w-full rounded-full bg-ui-shade/10">
            <View
              className="h-2 rounded-full bg-ui-highlight"
              style={{ width: `${completionPercent}%` }}
            />
          </View>
          {missingCount > 0 ? (
            <Text className="text-xs text-ui-shade mt-2">
              Add {missingCount} more details to reach 100%.
            </Text>
          ) : (
            <Text className="text-xs text-ui-shade mt-2">
              Great job! Your profile is complete.
            </Text>
          )}
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
