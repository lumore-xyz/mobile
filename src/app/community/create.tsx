import Button from "@/src/components/ui/Button";
import { TextInput } from "@/src/components/ui/TextInput";
import { useMediaPermisions } from "@/src/hooks/useMediaPermision";
import { createLocationRoom, getFormattedAddress } from "@/src/libs/apis";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { toUserFacingError } from "@/src/utils/userFacingError";
import { useLocation } from "@/src/service/providers/LocationProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

export default function CreateRoomScreen() {
  const { latitude, longitude, error } = useLocation();
  const { pickImageAsync } = useMediaPermisions();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUri, setCoverImageUri] = useState("");
  const hasLocation = latitude != null && longitude != null;
  const { data: address } = useQuery({
    queryKey: ["rooms", "create-address", latitude, longitude],
    queryFn: () => getFormattedAddress(latitude as number, longitude as number),
    enabled: hasLocation,
    staleTime: 5 * 60 * 1000,
  });
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const canSubmit = hasLocation && trimmedTitle.length >= 3;
  const titleProgress = Math.min(
    100,
    Math.round((trimmedTitle.length / 3) * 100),
  );
  const coordinatesLabel = useMemo(() => {
    if (!hasLocation) return "Waiting for location...";
    return `${latitude?.toFixed(5)}, ${longitude?.toFixed(5)}`;
  }, [hasLocation, latitude, longitude]);
  const handlePickCoverImage = useCallback(() => {
    pickImageAsync(
      (asset) => {
        setCoverImageUri(asset.uri);
      },
      { aspect: [4, 3], quality: 0.85 },
    );
  }, [pickImageAsync]);
  const mutation = useMutation({
    mutationFn: () =>
      createLocationRoom({
        title: trimmedTitle,
        description: trimmedDescription,
        latitude: latitude as number,
        longitude: longitude as number,
        formattedAddress: address,
        imageUri: coverImageUri || undefined,
      }),
    onSuccess: (data) => {
      router.replace(`/community/${data.room._id}`);
    },
    onError: (roomError: unknown) => {
      Alert.alert(
        "Could not create community",
        toUserFacingError(roomError, "Please try again in a moment."),
      );
    },
  });

  return (
    <ScrollView
      className="flex-1 bg-ui-surface-page px-4 pt-6"
      contentContainerClassName="pb-10"
      keyboardShouldPersistTaps="handled"
    >
      <View className="mb-5 overflow-hidden rounded-[24px] bg-ui-midnight p-5">
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text
              className="font-display text-3xl text-ui-paper"
              accessibilityRole="header"
            >
              Create community
            </Text>
            <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
              Start a local 24-hour pool for the people around your moment.
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

        <View className="mt-5 flex-row items-end justify-between gap-3">
          <View>
            <Text className="font-display text-3xl text-ui-paper">
              {hasLocation ? "Ready" : "Locating"}
            </Text>
            <Text className="mt-0.5 text-sm text-ui-paper/70">
              {hasLocation ? "Nearby pool setup" : "Waiting for your area"}
            </Text>
          </View>
          <View className="rounded-full bg-ui-champagne px-3 py-1.5">
            <Text className="text-xs font-bold text-ui-ink">24h cycle</Text>
          </View>
        </View>
      </View>

      <View className="gap-5 rounded-[24px] border border-ui-parchment bg-ui-paper p-5">
        <View>
          <View className="mb-3 flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-ink">
                Name the room
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                Make it specific enough that nearby people know the vibe.
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest/10">
              <Icon name="Sparkles" size={20} color={COLORS.forest} />
            </View>
          </View>

          <TextInput
            label="Community name"
            value={title}
            action={setTitle}
            placeholder="e.g. Koramangala Cafe Hop"
            autoCapitalize="words"
            isInvalid={title.length > 0 && trimmedTitle.length < 3}
            errorText={
              title.length > 0 && trimmedTitle.length < 3
                ? "Use at least 3 characters."
                : undefined
            }
          />

          <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-ui-ink/10">
            <View
              className="h-1.5 rounded-full bg-ui-forest"
              style={{ width: `${titleProgress}%` }}
            />
          </View>
        </View>

        <View>
          <TextInput
            label="Description"
            value={description}
            action={setDescription}
            placeholder="Who should join this community?"
          />
          <Text className="mt-2 text-xs text-ui-slate">
            {trimmedDescription.length
              ? `${trimmedDescription.length} characters`
              : "A short description helps people decide quickly."}
          </Text>
        </View>

        <View className="rounded-[24px] border border-ui-parchment bg-ui-ink/5 p-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1">
              <Text className="font-bold text-ui-ink">Cover image</Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                Optional, but a good cover makes the room feel alive nearby.
              </Text>
            </View>
            <Pressable
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
            </Pressable>
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
                  Tap to upload a community cover image
                </Text>
                <Text className="mt-1 text-center text-xs text-ui-slate">
                  A cafe, campus corner, event, or neighborhood shot works well.
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <View className="rounded-[24px] bg-ui-midnight p-4">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-champagne">
              <Icon
                name={hasLocation ? "MapPin" : "LocateFixed"}
                size={18}
                color={COLORS.ink}
              />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-ui-paper">Community location</Text>
              <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
                {address || coordinatesLabel}
              </Text>
              {error ? (
                <Text className="mt-2 text-sm leading-5 text-ui-paper/80">
                  {error}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <Button
          text={mutation.isPending ? "Creating..." : "Create and join pool"}
          className="rounded-full"
          disabled={!canSubmit || mutation.isPending}
          onClick={() => mutation.mutate()}
        />

        {!canSubmit ? (
          <Text className="text-center text-xs leading-5 text-ui-slate">
            Add a name with at least 3 characters and allow location access to
            create.
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
