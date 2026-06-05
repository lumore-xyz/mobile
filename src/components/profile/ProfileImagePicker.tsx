import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { triggerSelectionHaptic } from "@/src/utils/haptics";

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
    <View>
      <Pressable
        onPress={() => {
          triggerSelectionHaptic();
          onPickImage();
        }}
        disabled={isUploading}
        className="flex min-h-12 w-full flex-row items-center justify-start gap-4 rounded-2xl border border-ui-shade/10 bg-ui-light p-3"
        android_ripple={{ color: "rgba(84,19,136,0.06)", borderless: false }}
        accessibilityRole="button"
        accessibilityState={{ disabled: isUploading }}
      >
        <View className="bg-ui-background border border-ui-shade/10 h-20 w-20 aspect-square rounded-full">
          <Image
            source={{ uri: imageUri }}
            style={{
              resizeMode: "cover",
              width: "100%",
              height: "100%",
              borderRadius: 9999,
            }}
          />
        </View>
        <View>
          <Text className="text-base font-semibold">Profile photo</Text>
          <Text className="text-xs text-ui-shade mt-1">
            {isUploading ? "Uploading..." : "Tap to upload a clear photo"}
          </Text>
        </View>
      </Pressable>
    </View>
  );
});

export default ProfileImagePicker;
