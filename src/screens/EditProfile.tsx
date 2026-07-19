import SubPageBack from "@/src/components/headers/SubPageBack";
import Skeleton from "@/src/components/ui/Skeleton";
import { useMediaPermisions } from "@/src/hooks/useMediaPermision";
import { useUser } from "@/src/hooks/useUser";
import { uploadProfilePicture } from "@/src/libs/apis";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { toUserFacingError } from "@/src/utils/userFacingError";
import {
  ProfileFormValues,
  createProfileSchema,
} from "@/src/schemas/profileSchema";
import { queryClient } from "@/src/service/query-client";
import { PREFERENCE_MATCH_COUNT_QUERY_KEY } from "@/src/service/query-keys";
import { getUser } from "@/src/service/storage";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ImagePickerAsset } from "expo-image-picker";
import React, { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

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
        const response = await uploadProfilePicture({
          uri: asset.uri,
          name: asset.fileName || `profile-${Date.now()}.jpg`,
          type: asset.mimeType || "image/jpeg",
        });
        setUploadedImage(response?.profilePicture || null);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["user", userId] }),
          queryClient.invalidateQueries({
            queryKey: PREFERENCE_MATCH_COUNT_QUERY_KEY,
          }),
        ]);
      } catch (error: any) {
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
        currentValue={form.getValues(editFieldType as any)}
        isLoading={isUpdating}
        form={form}
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
        <View className="mb-5 overflow-hidden rounded-[32px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                className="text-[28px] font-bold leading-8 text-ui-light"
                accessibilityRole="header"
              >
                Make your profile feel like you
              </Text>
              <Text className="mt-2 text-sm leading-5 text-ui-light/70">
                Add the details that make it easy for someone to start a real
                conversation.
              </Text>
            </View>
            <View className="h-12 w-12 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="Sparkles" size={20} color={COLORS.shade} />
            </View>
          </View>
        </View>

        <ProfileImagePicker
          selectedImage={
            isUploadingImage ? selectedImage : (uploadedImage ?? undefined)
          }
          profilePicture={user?.profilePicture}
          onPickImage={handlePickImage}
          isUploading={isUploadingImage}
        />

        <View className="mt-4 rounded-[28px] border border-ui-border bg-ui-light p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-shade">
                Profile strength
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">
                Complete profiles give better matches more ways to connect.
              </Text>
            </View>
            <View className="min-h-11 min-w-14 items-center justify-center rounded-full bg-ui-highlight px-3">
              <Text className="font-bold text-ui-light">
                {completionPercent}%
              </Text>
            </View>
          </View>
          <View className="mt-4 h-2.5 w-full rounded-full bg-ui-highlight/10">
            <View
              className="h-2.5 rounded-full bg-ui-highlight"
              style={{ width: `${completionPercent}%` }}
            />
          </View>
          {missingCount > 0 ? (
            <Text className="mt-3 text-sm leading-5 text-ui-muted">
              Add {missingCount} more details to reach 100%.
            </Text>
          ) : (
            <Text className="mt-3 text-sm leading-5 text-ui-muted">
              Great job! Your profile is complete.
            </Text>
          )}
        </View>

        <View className="mt-4 flex-row gap-3">
          <Pressable
            onPress={() => handleEditField("bio")}
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full bg-ui-highlight px-4 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="Edit your bio"
          >
            <Icon name="PenLine" size={17} color={COLORS.light} />
            <Text className="font-semibold text-ui-light">Edit bio</Text>
          </Pressable>
          <Pressable
            onPress={() => handleEditField("interests")}
            className="min-h-12 flex-1 flex-row items-center justify-center gap-2 rounded-full border border-ui-highlight/25 bg-ui-light px-4 active:bg-ui-highlight/5"
            accessibilityRole="button"
            accessibilityLabel="Edit interests"
          >
            <Icon name="Heart" size={17} color={COLORS.highlight} />
            <Text className="font-semibold text-ui-highlight">Interests</Text>
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

const EditProfileSkeleton = () => (
  <View>
    <View className="items-center mt-2">
      <Skeleton width="100%" height={132} radius={32} />
      <Skeleton width={120} height={120} radius={30} style={{ marginTop: 16 }} />
      <Skeleton width={170} height={13} style={{ marginTop: 14 }} />
    </View>

    <View className="mt-6 rounded-[28px] border border-ui-border bg-ui-light p-5">
      <View className="flex-row items-center justify-between">
        <Skeleton width={140} height={14} />
        <Skeleton width={42} height={13} />
      </View>
      <Skeleton width="100%" height={8} radius={999} style={{ marginTop: 12 }} />
      <Skeleton width="48%" height={11} style={{ marginTop: 10 }} />
    </View>

    <View className="mt-5 gap-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <View
          key={`edit-profile-skeleton-${index}`}
          className="rounded-2xl border border-ui-shade/10 bg-white p-4"
        >
          <Skeleton width={index % 2 ? "38%" : "52%"} height={12} />
          <Skeleton width="86%" height={12} style={{ marginTop: 10 }} />
        </View>
      ))}
    </View>
  </View>
);

export default EditProfileScreen;
