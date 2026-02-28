import SubPageBack from "../components/headers/SubPageBack";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { useNsfw } from "../hooks/useNsfw";
import { submitThisOrThatQuestion } from "../libs/apis";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

const ThisOrThatSubmitScreen = () => {
  const { assertImageIsSafe } = useNsfw();
  const [leftOption, setLeftOption] = useState("");
  const [rightOption, setRightOption] = useState("");
  const [category, setCategory] = useState("");
  const [leftImageUri, setLeftImageUri] = useState<string | null>(null);
  const [rightImageUri, setRightImageUri] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async (setter: (uri: string) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== ImagePicker.PermissionStatus.GRANTED) {
      setError("Please enable photo permissions to upload images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!leftOption.trim() || !rightOption.trim()) {
      setError("Please enter both options.");
      return;
    }
    if (!leftImageUri || !rightImageUri) {
      setError("Please select both images.");
      return;
    }
    if (leftOption.trim().toLowerCase() === rightOption.trim().toLowerCase()) {
      setError("Options must be different.");
      return;
    }

    try {
      setIsSubmitting(true);
      await Promise.all([
        assertImageIsSafe(leftImageUri),
        assertImageIsSafe(rightImageUri),
      ]);

      await submitThisOrThatQuestion({
        leftOption: leftOption.trim(),
        rightOption: rightOption.trim(),
        category: category.trim() || undefined,
        leftImageUri,
        rightImageUri,
      });
      setLeftOption("");
      setRightOption("");
      setCategory("");
      setLeftImageUri(null);
      setRightImageUri(null);
      setError("Submitted! Your question is pending review.");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          (err instanceof Error ? err.message : null) ||
          "Submission failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-ui-light">
      <SubPageBack title="Submit Question" />
      <ScrollView className="p-4" contentContainerClassName="pb-10">
        <Text className="text-2xl font-semibold text-ui-shade">Submit a question</Text>
        <Text className="text-xs text-ui-shade/70 mt-1">
          Add two options with images. We will review before publishing.
        </Text>

        <View className="mt-4">
          <TextInput
            label="Left option"
            value={leftOption}
            action={setLeftOption}
            placeholder="Option A"
          />
        </View>
        <View className="mt-4">
          <TextInput
            label="Right option"
            value={rightOption}
            action={setRightOption}
            placeholder="Option B"
          />
        </View>
        <View className="mt-4">
          <TextInput
            label="Category (optional)"
            value={category}
            action={setCategory}
            placeholder="Lifestyle, Food, Travel..."
          />
        </View>

        <View className="mt-4 rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-sm text-ui-shade">Left image</Text>
          <Pressable
            onPress={() => pickImage((uri) => setLeftImageUri(uri))}
            className="mt-3"
          >
            {leftImageUri ? (
              <Image
                source={{ uri: leftImageUri }}
                className="w-full h-48 rounded-xl"
                style={{ resizeMode: "cover" }}
              />
            ) : (
              <View className="h-40 rounded-xl border border-dashed border-ui-shade/30 items-center justify-center">
                <Text className="text-xs text-ui-shade">Tap to select image</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View className="mt-4 rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-sm text-ui-shade">Right image</Text>
          <Pressable
            onPress={() => pickImage((uri) => setRightImageUri(uri))}
            className="mt-3"
          >
            {rightImageUri ? (
              <Image
                source={{ uri: rightImageUri }}
                className="w-full h-48 rounded-xl"
                style={{ resizeMode: "cover" }}
              />
            ) : (
              <View className="h-40 rounded-xl border border-dashed border-ui-shade/30 items-center justify-center">
                <Text className="text-xs text-ui-shade">Tap to select image</Text>
              </View>
            )}
          </Pressable>
        </View>

        {error ? (
          <Text className={`text-sm mt-3 ${error.startsWith("Submitted") ? "text-green-600" : "text-red-500"}`}>
            {error}
          </Text>
        ) : null}

        <View className="mt-6">
          <Button
            text={isSubmitting ? "Submitting..." : "Submit question"}
            onClick={handleSubmit}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ThisOrThatSubmitScreen;
