import VisibilityToggle from "@/src/components/VisibilityToggle";
import { TextAreaInput } from "@/src/components/ui/TextInput";
import { useMediaPermisions } from "@/src/hooks/useMediaPermision";
import { useNsfw } from "@/src/hooks/useNsfw";
import { createImagePost } from "@/src/libs/apis";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import SubPageBack from "../../components/headers/SubPageBack";

const CreateImagePost = () => {
  const { pickImageAsync, selectedImage } = useMediaPermisions();
  const { assertImageIsSafe } = useNsfw();
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError("Please select an image to continue.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await assertImageIsSafe(selectedImage);

      await createImagePost({
        imageUri: selectedImage,
        caption: caption.trim(),
        visibility,
      });
      const currentUser = getUser();
      if (currentUser?._id) {
        await queryClient.invalidateQueries({
          queryKey: ["user posts", currentUser._id],
        });
      }
      router.push("/profile");
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        (err instanceof Error ? err.message : null) ||
        "Upload failed. Please try again.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-ui-light p-4">
      <SubPageBack title="Image post" />
      {/* <Text className="text-2xl font-semibold">Image post</Text> */}
      <Text className="text-xs text-ui-shade mt-1">
        Share a photo with a short caption.
      </Text>

      <View className="mt-4 border border-ui-shade/10 rounded-2xl p-4 bg-white">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-ui-shade">Upload image</Text>
          <Pressable
            onPress={pickImageAsync}
            className="px-3 py-1 rounded-full border border-ui-shade/20"
          >
            <Text className="text-xs">Choose</Text>
          </Pressable>
        </View>

        <Pressable onPress={pickImageAsync} className="mt-3">
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-64 rounded-xl"
              style={{ resizeMode: "cover" }}
            />
          ) : (
            <View className="h-48 rounded-xl border border-dashed border-ui-shade/30 items-center justify-center">
              <Text className="text-xs text-ui-shade">
                Tap to select an image
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <View className="mt-4">
        <TextAreaInput
          label="Caption"
          value={caption}
          action={setCaption}
          placeholder="Say something about this photo..."
        />
      </View>

      <View className="mt-4 border border-ui-shade/10 rounded-xl p-3 bg-white">
        <Text className="text-xs text-ui-shade mb-2">Visibility</Text>
        <VisibilityToggle
          field="imagePost"
          currentVisibility={visibility}
          onVisibilityChange={(_, vis) => setVisibility(vis)}
        />
      </View>

      {error ? (
        <Text className="text-red-500 text-sm mt-2">{error}</Text>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        className={`mt-6 py-3 rounded-xl bg-ui-accent ${
          isSubmitting ? "opacity-70" : ""
        }`}
      >
        <Text className="text-center text-white font-semibold">
          {isSubmitting ? "Posting..." : "Post image"}
        </Text>
      </Pressable>
    </View>
  );
};

export default CreateImagePost;
