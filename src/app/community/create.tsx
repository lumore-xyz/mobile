import SurfacePanel from "@/src/components/ui/SurfacePanel";
import Button from "@/src/components/ui/Button";
import CommunityTagPicker from "@/src/components/community/CommunityTagPicker";
import CommunityLocationPicker from "@/src/components/community/CommunityLocationPicker";
import { TextInput } from "@/src/components/ui/TextInput";
import { useMediaPermisions } from "@/src/hooks/useMediaPermision";
import { createLocationRoom } from "@/src/features/community/api";
import useCommunityLocationSelection from "@/src/features/community/useCommunityLocationSelection";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import showErrorAlert from "@/src/utils/showErrorAlert";
import { useMutation } from "@tanstack/react-query";
import type { ImagePickerAsset } from "expo-image-picker";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function CreateRoomScreen() {
  const { pickImageAsync } = useMediaPermisions();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverImageUri, setCoverImageUri] = useState("");
  const [type, setType] = useState<"local" | "topic">("local");
  const {
    query: locationQuery,
    selectedLocation,
    predictions,
    searchError: locationSearchError,
    isSearching: isSearchingLocation,
    mapRegion,
    setMapRegion,
    updateQuery: updateLocationQuery,
    selectPlace,
    selectMapPin,
  } = useCommunityLocationSelection();
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const canSubmit = (type === "topic" || selectedLocation !== null) && trimmedTitle.length >= 3;
  const handlePickCoverImage = useCallback(() => {
    pickImageAsync(
      (asset: ImagePickerAsset) => {
        setCoverImageUri(asset.uri);
      },
      { aspect: [4, 3], quality: 0.85 },
    );
  }, [pickImageAsync]);
  const mutation = useMutation({
    mutationFn: () =>
      createLocationRoom({
        title: trimmedTitle,
        type,
        description: trimmedDescription,
        tags,
        ...(type === "local" ? {
          latitude: selectedLocation!.latitude,
          longitude: selectedLocation!.longitude,
          formattedAddress: selectedLocation!.formattedAddress,
        } : {}),
        imageUri: coverImageUri || undefined,
      }),
    onSuccess: (data) => {
      router.replace(`/community/${data.room._id}`);
    },
    onError: (roomError: unknown) => {
      showErrorAlert("Could not create community", roomError);
    },
  });

  return (
    <ScrollView
      className="flex-1 bg-ui-surface-page px-4 pt-6"
      contentContainerClassName="pb-10"
      keyboardShouldPersistTaps="handled"
    >
      <SurfacePanel surface="midnight" className="mb-5 overflow-hidden">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text
              className="font-display text-3xl text-ui-paper"
              accessibilityRole="header"
            >
              Create a community
            </Text>
            <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
              Bring people together around a place or a shared interest.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => router.back()}
            className="h-11 w-11 items-center justify-center rounded-full bg-ui-paper/10 active:opacity-75"
          >
            <Icon name="X" size={21} color={COLORS.paper} />
          </Pressable>
        </View>

        <View className="mt-5 flex-row items-center justify-between gap-3">
          <Text className="flex-1 text-sm leading-5 text-ui-paper/75">
            {type === "topic" ? "Open to everyone who shares the interest." : selectedLocation ? "Your place is selected." : "You’ll choose a place below."}
          </Text>
          <View className="rounded-full bg-ui-champagne px-3 py-1.5">
            <Text className="text-xs font-bold text-ui-ink">Matches every 24h</Text>
          </View>
        </View>
      </SurfacePanel>

      <SurfacePanel surface="paper" className="gap-5">
        <View>
          <Text className="mb-2 font-bold text-ui-ink">What brings people together?</Text>
          <View className="flex-row gap-3">
            {(["local", "topic"] as const).map((option) => (
              <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected: type === option }} onPress={() => setType(option)} className={`min-h-11 flex-1 items-center justify-center rounded-2xl px-4 py-3 ${type === option ? "bg-ui-forest" : "bg-ui-porcelain"}`}>
                <Text className={type === option ? "font-semibold text-ui-paper" : "font-semibold text-ui-ink"}>{option === "local" ? "A place" : "An interest"}</Text>
                <Text className={`mt-0.5 text-center text-xs ${type === option ? "text-ui-paper/75" : "text-ui-slate"}`}>{option === "local" ? "Meet nearby" : "Gather around a topic"}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        {type === "local" ? (
          <CommunityLocationPicker
            query={locationQuery}
            selectedLocation={selectedLocation}
            predictions={predictions}
            searchError={locationSearchError}
            isSearching={isSearchingLocation}
            mapRegion={mapRegion}
            onQueryChange={updateLocationQuery}
            onSelectPlace={(prediction) => void selectPlace(prediction)}
            onMapPress={(event) => void selectMapPin(event)}
            onMapRegionChange={setMapRegion}
          />
        ) : (
          <Text className="text-sm leading-5 text-ui-slate">
            Topic communities are open to people who share the interest and don’t need a location.
          </Text>
        )}
        <View>
          <View className="mb-3 flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-ink">
                Give it a name
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                {type === "local" ? "Make it easy for people in the area to recognize." : "Make the shared interest clear at a glance."}
              </Text>
            </View>
          </View>

          <TextInput
            label="Community name"
            value={title}
            action={setTitle}
            placeholder={type === "local" ? "e.g. Koramangala Cafe Hop" : "e.g. One Piece fans"}
            autoCapitalize="words"
            isInvalid={title.length > 0 && trimmedTitle.length < 3}
            errorText={
              title.length > 0 && trimmedTitle.length < 3
                ? "Use at least 3 characters."
                : undefined
            }
          />

        </View>

        <View>
          <TextInput
            label="Description"
            value={description}
            action={setDescription}
            placeholder="What will people enjoy or do together?"
          />
          <Text className="mt-2 text-xs text-ui-slate">
            {trimmedDescription.length
              ? `${trimmedDescription.length} characters`
              : "A sentence or two is plenty."}
          </Text>
        </View>

        <CommunityTagPicker type={type} tags={tags} onChange={setTags} />

        <View className="rounded-[24px] border border-ui-parchment bg-ui-ink/5 p-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="font-bold text-ui-ink">Cover image</Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                Optional. Choose an image that gives people a feel for the community.
              </Text>
            </View>
            {coverImageUri ? <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                coverImageUri ? "Change cover image" : "Upload cover image"
              }
              onPress={handlePickCoverImage}
              className="min-h-11 items-center justify-center rounded-full border border-ui-parchment bg-ui-paper px-4 active:opacity-75"
            >
              <Text className="font-semibold text-ui-ink">
                {coverImageUri ? "Change" : "Upload"}
              </Text>
            </Pressable> : null}
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              coverImageUri
                ? "Change community cover image"
                : "Upload community cover image"
            }
            onPress={handlePickCoverImage}
            className="mt-4 active:opacity-90"
          >
            {coverImageUri ? (
              <Image
                source={{ uri: coverImageUri }}
                className="h-48 w-full rounded-[24px] bg-ui-porcelain"
                contentFit="cover"
              />
            ) : (
              <View className="h-44 items-center justify-center rounded-[24px] border border-dashed border-ui-parchment bg-ui-paper px-4">
                <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
                  <Icon name="ImagePlus" size={24} color={COLORS.forest} />
                </View>
                <Text className="mt-3 text-center text-sm font-semibold text-ui-ink">
                  Add a cover image (optional)
                </Text>
                <Text className="mt-1 text-center text-xs text-ui-slate">
                  {type === "local" ? "A favorite café, campus spot, or neighborhood works well." : "Choose an image that reflects the topic or fandom."}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <Button
          text={mutation.isPending ? "Creating..." : "Create community"}
          className="rounded-full"
          disabled={!canSubmit || mutation.isPending}
          onClick={() => mutation.mutate()}
        />

        {!canSubmit ? (
          <Text className="text-center text-xs leading-5 text-ui-slate">
            {type === "local" ? "Add a name and choose a place to continue." : "Add a name with at least 3 characters to continue."}
          </Text>
        ) : null}
      </SurfacePanel>
    </ScrollView>
  );
}
