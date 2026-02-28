import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Linking, Platform } from "react-native";

export const useMediaPermisions = () => {
  const [selectedImage, setSelectedImage] = useState("");
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
    ImagePicker.useMediaLibraryPermissions();

  const openSettingsAlert = () => {
    Alert.alert(
      "Permission required",
      "Please enable media library permissions in your device settings to select an image.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Open Settings",
          onPress: () => {
            if (Platform.OS === "ios") {
              Linking.openURL("app-settings:");
              return;
            }
            // Open the app's settings screen
            Linking.openSettings();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const pickImageAsync = async (
    onPicked?:
      | ((asset: ImagePicker.ImagePickerAsset) => void | Promise<void>)
      | unknown,
  ) => {
    try {
      if (Platform.OS !== "web") {
        if (
          mediaLibraryPermission?.status !==
          ImagePicker.PermissionStatus.GRANTED
        ) {
          const permissionResponse = await requestMediaLibraryPermission();
          if (
            permissionResponse.status !== ImagePicker.PermissionStatus.GRANTED
          ) {
            openSettingsAlert();
            return;
          }
        }
      }
      // Launch the image library
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true, // Allows the user to crop the image
        aspect: [1, 1], // Maintenance of aspect ratio on Android
        quality: 0.8, // Maximum quality
      });
      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        setSelectedImage(selectedAsset.uri);
        if (typeof onPicked === "function") {
          await onPicked(selectedAsset);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return { pickImageAsync, selectedImage };
};
