import SurfacePanel from "@/src/components/ui/SurfacePanel";
import VisibilityToggle from "@/src/components/VisibilityToggle";
import Button from "@/src/components/ui/Button";
import TextAreaInput from "@/src/components/ui/TextAreaInput";
import { createTextPost } from "@/src/features/posts/api";
import invalidateCurrentUserPosts from "@/src/features/posts/invalidateCurrentUserPosts";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import SubPageBack from "../../components/headers/SubPageBack";

const CreateFreeTextPost = () => {
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const trimmedText = text.trim();

  const handleSubmit = async () => {
    if (!trimmedText) {
      setError("Please write something before posting.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await createTextPost({
        text: trimmedText,
        visibility,
      });
      await invalidateCurrentUserPosts();
      router.push("/profile");
    } catch {
      setError("Post failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-ui-surface-page">
      <SubPageBack title="Free text" />
      <ScrollView
        className="flex-1 px-4"
        contentContainerClassName="pb-10 pt-3"
        keyboardShouldPersistTaps="handled"
      >
        <SurfacePanel surface="midnight" className="mb-5 overflow-hidden">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-ui-paper">
                Say it your way
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
                Share a thought, quote, story, or small truth that gives your
                profile more texture.
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-champagne">
              <Icon name="PencilLine" size={20} color={COLORS.ink} />
            </View>
          </View>
        </SurfacePanel>

        <SurfacePanel surface="paper" className="gap-5">
          <TextAreaInput
            label="Your words"
            value={text}
            action={setText}
            placeholder="Write your thought, quote, or story here..."
          />
          <Text className="text-xs text-ui-slate">
            {trimmedText.length
              ? `${trimmedText.length} characters`
              : "A few honest lines can be enough."}
          </Text>

          <View className="rounded-[24px] border border-ui-parchment bg-ui-ink/5 p-4">
            <Text className="mb-3 text-sm font-bold text-ui-ink">
              Visibility
            </Text>
            <VisibilityToggle
              field="textPost"
              currentVisibility={visibility}
              onVisibilityChange={(_, vis) => setVisibility(vis)}
              className="w-full"
            />
          </View>

          {error ? (
            <View className="rounded-2xl bg-ui-danger/5 px-4 py-3">
              <Text className="text-sm font-medium text-ui-danger">{error}</Text>
            </View>
          ) : null}

          <Button
            text={isSubmitting ? "Posting..." : "Post text"}
            disabled={isSubmitting || !trimmedText}
            onClick={handleSubmit}
            className="rounded-full"
          />
        </SurfacePanel>
      </ScrollView>
    </View>
  );
};

export default CreateFreeTextPost;
