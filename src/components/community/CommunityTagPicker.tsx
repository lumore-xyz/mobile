import { TextInput } from "@/src/components/ui/TextInput";
import formatCommunityTag from "@/src/features/community/formatCommunityTag";
import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

const TAG_LIMIT = 5;
const TAG_LENGTH_LIMIT = 24;

const TAG_TEMPLATES = {
  local: ["cafes", "food", "outdoors", "fitness", "books", "events", "study", "arts", "pets", "wellness"],
  topic: ["anime", "manga", "gaming", "books", "film & tv", "music", "fitness", "food", "travel", "technology"],
} as const;

export default function CommunityTagPicker({
  type,
  tags,
  onChange,
}: {
  type: "local" | "topic";
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [customTag, setCustomTag] = useState("");
  const normalizedCustomTag = customTag.trim().replace(/^#/, "").replace(/\s+/g, " ").toLocaleLowerCase();

  const toggleTag = (tag: string) => {
    onChange(tags.includes(tag) ? tags.filter((item) => item !== tag) : tags.length < TAG_LIMIT ? [...tags, tag] : tags);
  };

  const addCustomTag = () => {
    if (!normalizedCustomTag || [...normalizedCustomTag].length > TAG_LENGTH_LIMIT || tags.length >= TAG_LIMIT || tags.includes(normalizedCustomTag)) return;
    onChange([...tags, normalizedCustomTag]);
    setCustomTag("");
  };

  return (
    <View>
      <Text className="font-bold text-ui-ink">Add tags</Text>
      <Text className="mt-1 text-sm leading-5 text-ui-slate">
        Choose a few topics to help people find this community.
      </Text>
      <View className="mt-3 flex-row flex-wrap gap-2">
        {TAG_TEMPLATES[type].map((tag) => {
          const selected = tags.includes(tag);
          return (
            <Pressable
              key={tag}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: !selected && tags.length >= TAG_LIMIT }}
              onPress={() => toggleTag(tag)}
              disabled={!selected && tags.length >= TAG_LIMIT}
              className={`min-h-10 justify-center rounded-full border px-3 py-2 ${selected ? "border-ui-forest bg-ui-forest" : "border-ui-parchment bg-ui-paper"} ${!selected && tags.length >= TAG_LIMIT ? "opacity-40" : "active:opacity-75"}`}
            >
              <Text className={`text-sm font-semibold ${selected ? "text-ui-paper" : "text-ui-ink"}`}>{formatCommunityTag(tag)}</Text>
            </Pressable>
          );
        })}
      </View>
      <View className="mt-3 flex-row items-end gap-2">
        <View className="flex-1">
          <TextInput
            label="Your own tag"
            value={customTag}
            action={setCustomTag}
            placeholder="e.g. weekend walks"
            errorText={customTag.trim().replace(/^#/, "").length > TAG_LENGTH_LIMIT ? `Keep tags to ${TAG_LENGTH_LIMIT} characters.` : undefined}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={addCustomTag}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add custom tag"
          accessibilityState={{ disabled: !normalizedCustomTag || tags.length >= TAG_LIMIT }}
          disabled={!normalizedCustomTag || tags.length >= TAG_LIMIT}
          onPress={addCustomTag}
          className={`mb-1 min-h-11 justify-center rounded-full bg-ui-forest px-4 ${!normalizedCustomTag || tags.length >= TAG_LIMIT ? "opacity-40" : "active:opacity-75"}`}
        >
          <Text className="font-semibold text-ui-paper">Add</Text>
        </Pressable>
      </View>
      <Text className="mt-1 text-xs text-ui-slate">{tags.length}/{TAG_LIMIT} tags · up to {TAG_LENGTH_LIMIT} characters each</Text>
      {tags.length ? (
        <View className="mt-3 flex-row flex-wrap gap-2">
          {tags.map((tag) => (
            <Pressable
              key={tag}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${formatCommunityTag(tag)} tag`}
              onPress={() => onChange(tags.filter((item) => item !== tag))}
              className="min-h-10 flex-row items-center rounded-full bg-ui-champagne px-3 py-2 active:opacity-75"
            >
              <Text className="text-sm font-semibold text-ui-ink">{formatCommunityTag(tag)} ×</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
