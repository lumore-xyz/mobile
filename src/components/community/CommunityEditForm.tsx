import Button from "@/src/components/ui/Button";
import CommunityCoverImage from "@/src/components/community/CommunityCoverImage";
import CommunityTagPicker from "@/src/components/community/CommunityTagPicker";
import TextAreaInput from "@/src/components/ui/TextAreaInput";
import { TextInput } from "@/src/components/ui/TextInput";
import type { LocationRoomSummary } from "@/src/features/community/types";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { Pressable, Text, View } from "react-native";

interface CommunityEditFormProps {
  room: LocationRoomSummary;
  editedTitle: string;
  onTitleChange: (value: string) => void;
  editedDescription: string;
  onDescriptionChange: (value: string) => void;
  editedTags: string[];
  onTagsChange: (value: string[]) => void;
  editedCoverImageUri: string;
  canSave: boolean;
  isSaving: boolean;
  onPickCoverImage: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function CommunityEditForm({
  room,
  editedTitle,
  onTitleChange,
  editedDescription,
  onDescriptionChange,
  editedTags,
  onTagsChange,
  editedCoverImageUri,
  canSave,
  isSaving,
  onPickCoverImage,
  onSave,
  onCancel,
}: CommunityEditFormProps) {
  const trimmedTitle = editedTitle.trim();
  const trimmedDescription = editedDescription.trim();
  const coverImageUri = editedCoverImageUri || room.imageUrl;

  return (
    <View className="gap-3">
      <View className="rounded-[24px] border border-ui-parchment bg-ui-paper p-4">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="font-semibold text-ui-ink">Cover image</Text>
            <Text className="mt-1 text-sm leading-5 text-ui-slate">
              Upload a fresh image to update this community&apos;s cover.
            </Text>
          </View>
          <Pressable
            onPress={onPickCoverImage}
            className="rounded-full border border-ui-parchment bg-ui-paper px-4 py-2 active:opacity-75"
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Change community cover image"
          >
            <Text className="font-semibold text-ui-ink">
              {coverImageUri ? "Change" : "Upload"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={onPickCoverImage}
          className="mt-4"
          accessibilityRole="button"
          accessibilityLabel="Upload community cover image"
        >
          {coverImageUri ? (
            <CommunityCoverImage
              uri={coverImageUri}
              className="h-44 w-full overflow-hidden rounded-2xl bg-ui-porcelain"
            />
          ) : (
            <View className="h-40 items-center justify-center rounded-2xl border border-dashed border-ui-parchment bg-ui-paper px-4">
              <Icon name="Image" size={28} color={COLORS.slate} />
              <Text className="mt-2 text-center text-sm text-ui-slate">
                Tap to upload a community cover image
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <TextInput
        label="Community name"
        value={editedTitle}
        action={onTitleChange}
        placeholder="e.g. Indiranagar Evenings"
        autoCapitalize="words"
        isInvalid={editedTitle.length > 0 && trimmedTitle.length < 3}
        errorText={
          editedTitle.length > 0 && trimmedTitle.length < 3
            ? "Use at least 3 characters."
            : undefined
        }
      />
      <TextAreaInput
        label="Description"
        value={editedDescription}
        action={onDescriptionChange}
        placeholder="Who should join this community?"
        errorText={
          trimmedDescription.length > 500
            ? "Keep it under 500 characters."
            : undefined
        }
      />
      <CommunityTagPicker
        type={room.type || "local"}
        tags={editedTags}
        onChange={onTagsChange}
      />
      <Button
        text={isSaving ? "Saving..." : "Save community changes"}
        className="rounded-full"
        disabled={!canSave || isSaving}
        onClick={onSave}
      />
      <Button
        text="Cancel"
        variant="outline"
        className="rounded-full"
        disabled={isSaving}
        onClick={onCancel}
      />
    </View>
  );
}
