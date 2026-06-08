import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert, Linking, Platform } from "react-native";

type PickImageOptions = {
  aspect?: [number, number];
  quality?: number;
  allowsEditing?: boolean;
};

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
    onPickedOrOptions?:
      | ((asset: ImagePicker.ImagePickerAsset) => void | Promise<void>)
      | PickImageOptions
      | unknown,
    maybeOptions?: PickImageOptions,
  ) => {
    try {
      const onPicked =
        typeof onPickedOrOptions === "function" ? onPickedOrOptions : undefined;
      const pickerOptions =
        typeof onPickedOrOptions === "function"
          ? maybeOptions
          : (onPickedOrOptions as PickImageOptions | undefined);

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
        allowsEditing: pickerOptions?.allowsEditing ?? true,
        aspect: pickerOptions?.aspect ?? [1, 1],
        quality: pickerOptions?.quality ?? 0.8,
      });
      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        setSelectedImage(selectedAsset.uri);
        if (typeof onPicked === "function") {
          await onPicked(selectedAsset);
        }
      }
    } catch {
      // Keep silent here; caller/UI decides whether to surface errors.
    }
  };

  return { pickImageAsync, selectedImage };
};
