import React from "react";
import { Image } from "expo-image";
import { Pressable, Text, View } from "react-native";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";

interface ProfileImagePickerProps {
  selectedImage?: string;
  profilePicture?: string;
  onPickImage: () => void;
  isUploading?: boolean;
}

const ProfileImagePicker = React.memo(function ProfileImagePicker({
  selectedImage,
  profilePicture,
  onPickImage,
  isUploading = false,
}: ProfileImagePickerProps) {
  const imageUri =
    selectedImage ||
    profilePicture ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  return (
    <View className="overflow-hidden rounded-[24px] border border-ui-parchment bg-ui-paper">
      <View className="p-4">
        <Text className="text-xl font-bold text-ui-ink">Profile photo</Text>
        <Text className="mt-1 text-sm leading-5 text-ui-slate">
          Choose a clear, warm photo — this is the first hello.
        </Text>
      </View>

      <View className="px-4">
        <View className="overflow-hidden rounded-[24px] bg-ui-surface-page">
          <Image
            source={{ uri: imageUri }}
            contentFit="cover"
            accessibilityLabel="Current profile photo"
            style={{
              width: "100%",
              aspectRatio: 0.92,
            }}
          />
        </View>
      </View>

      <Pressable
        onPress={() => {
          triggerSelectionHaptic();
          onPickImage();
        }}
        disabled={isUploading}
        className={`m-4 min-h-12 flex-row items-center justify-center gap-2 rounded-2xl bg-ui-forest px-4 ${
          isUploading ? "opacity-60" : "active:opacity-80"
        }`}
        android_ripple={{ color: `${COLORS.paper}24`, borderless: false }}
        accessibilityRole="button"
        accessibilityLabel={
          isUploading ? "Uploading profile photo" : "Change profile photo"
        }
        accessibilityState={{ disabled: isUploading }}
      >
        <Icon
          name={isUploading ? "LoaderCircle" : "Camera"}
          size={18}
          color={COLORS.paper}
        />
        <Text className="font-semibold text-ui-paper">
          {isUploading ? "Uploading..." : "Change photo"}
        </Text>
      </Pressable>
    </View>
  );
});

export default ProfileImagePicker;
