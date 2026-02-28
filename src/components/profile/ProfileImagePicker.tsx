import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface ProfileImagePickerProps {
  selectedImage?: string;
  profilePicture?: string;
  onPickImage: () => void;
  isUploading?: boolean;
}

const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  selectedImage,
  profilePicture,
  onPickImage,
  isUploading = false,
}) => {
  const imageUri =
    selectedImage ||
    profilePicture ||
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  return (
    <View>
      <Pressable
        onPress={onPickImage}
        disabled={isUploading}
        className="flex flex-row gap-4 items-center justify-start w-full p-3 rounded-2xl bg-ui-light border border-ui-shade/10"
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
};

export default ProfileImagePicker;
