import VisibilityToggle from "@/src/components/VisibilityToggle";
import Button from "@/src/components/ui/Button";
import { TextAreaInput } from "@/src/components/ui/TextInput";
import { useMediaPermisions } from "@/src/hooks/useMediaPermision";
import { createImagePost } from "@/src/libs/apis";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";
import { toUserFacingError } from "@/src/utils/userFacingError";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import SubPageBack from "../../components/headers/SubPageBack";

const CreateImagePost = () => {
  const { pickImageAsync, selectedImage } = useMediaPermisions();
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const trimmedCaption = caption.trim();

  const handleSubmit = async () => {
    if (!selectedImage) {
      setError("Please select an image to continue.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await createImagePost({
        imageUri: selectedImage,
        caption: trimmedCaption,
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
      setError(
        toUserFacingError(
          err,
          "We couldn't upload that image. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Image post" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-10 pt-3"
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-5 overflow-hidden rounded-[28px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-ui-light">
                Let the photo lead
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-light/70">
                Add a picture and a caption that gives people something to ask
                about.
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-primary">
              <Icon name="ImagePlus" size={20} color={COLORS.shade} />
            </View>
          </View>
        </View>

        <View className="gap-5 rounded-[28px] border border-ui-border bg-ui-light p-5">
          <View className="rounded-[24px] border border-ui-border bg-ui-shade/5 p-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1">
                <Text className="font-bold text-ui-shade">Upload image</Text>
                <Text className="mt-1 text-sm leading-5 text-ui-muted">
                  Pick something clear, recent, and recognizably you.
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={selectedImage ? "Change image" : "Choose image"}
                onPress={pickImageAsync}
                className="min-h-11 items-center justify-center rounded-full border border-ui-border bg-ui-light px-4 active:opacity-75"
              >
                <Text className="font-semibold text-ui-shade">
                  {selectedImage ? "Change" : "Choose"}
                </Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={selectedImage ? "Change selected image" : "Select an image"}
              onPress={pickImageAsync}
              className="mt-4 active:opacity-90"
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  className="h-72 w-full rounded-[24px] bg-ui-background"
                  style={{ resizeMode: "cover" }}
                />
              ) : (
                <View className="h-56 items-center justify-center rounded-[24px] border border-dashed border-ui-border bg-ui-light px-4">
                  <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-highlight/10">
                    <Icon name="ImagePlus" size={24} color={COLORS.highlight} />
                  </View>
                  <Text className="mt-3 text-center text-sm font-semibold text-ui-shade">
                    Tap to select an image
                  </Text>
                  <Text className="mt-1 text-center text-xs text-ui-muted">
                    Your photo becomes the visual anchor of this post.
                  </Text>
                </View>
              )}
            </Pressable>
          </View>

          <View>
            <TextAreaInput
              label="Caption"
              value={caption}
              action={setCaption}
              placeholder="Say something about this photo..."
            />
            <Text className="mt-2 text-xs text-ui-muted">
              {trimmedCaption.length
                ? `${trimmedCaption.length} characters`
                : "Optional, but a caption makes the photo easier to respond to."}
            </Text>
          </View>

          <View className="rounded-[24px] border border-ui-border bg-ui-shade/5 p-4">
            <Text className="mb-3 text-sm font-bold text-ui-shade">
              Visibility
            </Text>
            <VisibilityToggle
              field="imagePost"
              currentVisibility={visibility}
              onVisibilityChange={(_, vis) => setVisibility(vis)}
              className="w-full"
            />
          </View>

          {error ? (
            <View className="rounded-2xl bg-red-50 px-4 py-3">
              <Text className="text-sm font-medium text-ui-danger">{error}</Text>
            </View>
          ) : null}

          <Button
            text={isSubmitting ? "Posting..." : "Post image"}
            disabled={isSubmitting || !selectedImage}
            onClick={handleSubmit}
            className="rounded-full"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default CreateImagePost;
