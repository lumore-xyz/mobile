import VisibilityToggle from "@/src/components/VisibilityToggle";
import { TextAreaInput } from "@/src/components/ui/TextInput";
import { createTextPost } from "@/src/libs/apis";
import { queryClient } from "@/src/service/query-client";
import { getUser } from "@/src/service/storage";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

const CreateFreeTextPost = () => {
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError("Please write something before posting.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await createTextPost({
        text: text.trim(),
        visibility,
      });
      const currentUser = getUser();
      if (currentUser?._id) {
        await queryClient.invalidateQueries({
          queryKey: ["user posts", currentUser._id],
        });
      }
      router.push("/profile");
    } catch {
      setError("Post failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-ui-light p-4">
      <Text className="text-2xl font-semibold">Free text</Text>
      <Text className="text-xs text-ui-shade mt-1">
        Share a thought, quote, or story.
      </Text>

      <View className="mt-4">
        <TextAreaInput
          label="Your words"
          value={text}
          action={setText}
          placeholder="Write your shayari or quote here..."
        />
      </View>

      <View className="mt-4 border border-ui-shade/10 rounded-xl p-3 bg-white">
        <Text className="text-xs text-ui-shade mb-2">Visibility</Text>
        <VisibilityToggle
          field="textPost"
          currentVisibility={visibility}
          onVisibilityChange={(_, vis) => setVisibility(vis)}
        />
      </View>

      {error ? <Text className="text-red-500 text-sm mt-2">{error}</Text> : null}

      <Pressable
        onPress={handleSubmit}
        disabled={isSubmitting}
        className={`mt-6 py-3 rounded-xl bg-cyan-700 ${
          isSubmitting ? "opacity-70" : ""
        }`}
      >
        <Text className="text-center text-white font-semibold">
          {isSubmitting ? "Posting..." : "Post text"}
        </Text>
      </Pressable>
    </View>
  );
};

export default CreateFreeTextPost;
