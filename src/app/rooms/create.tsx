import Button from "@/src/components/ui/Button";
import { TextInput } from "@/src/components/ui/TextInput";
import {
  createLocationRoom,
  getFormattedAddress,
} from "@/src/libs/apis";
import Icon from "@/src/libs/Icon";
import { useLocation } from "@/src/service/providers/LocationProvider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function CreateRoomScreen() {
  const { latitude, longitude, error } = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const hasLocation = latitude != null && longitude != null;
  const { data: address } = useQuery({
    queryKey: ["rooms", "create-address", latitude, longitude],
    queryFn: () => getFormattedAddress(latitude as number, longitude as number),
    enabled: hasLocation,
    staleTime: 5 * 60 * 1000,
  });
  const trimmedTitle = title.trim();
  const canSubmit = hasLocation && trimmedTitle.length >= 3;
  const coordinatesLabel = useMemo(() => {
    if (!hasLocation) return "Waiting for location...";
    return `${latitude?.toFixed(5)}, ${longitude?.toFixed(5)}`;
  }, [hasLocation, latitude, longitude]);
  const mutation = useMutation({
    mutationFn: () =>
      createLocationRoom({
        title: trimmedTitle,
        description: description.trim(),
        latitude: latitude as number,
        longitude: longitude as number,
        formattedAddress: address,
      }),
    onSuccess: (data) => {
      router.replace(`/rooms/${data.room._id}` as any);
    },
    onError: (roomError: any) => {
      Alert.alert(
        "Could not create room",
        roomError?.response?.data?.message || "Please try again in a moment.",
      );
    },
  });

  return (
    <ScrollView className="flex-1 bg-ui-light px-4 pt-6">
      <View className="mb-5 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-11 w-11 items-center justify-center rounded-full bg-white"
        >
          <Icon type="Ionicons" name="arrow-back-outline" size={22} />
        </TouchableOpacity>
        <View>
          <Text className="text-3xl font-bold tracking-tight">Create Room</Text>
          <Text className="text-ui-shade/70">Start a 24-hour local pool.</Text>
        </View>
      </View>

      <View className="rounded-3xl border border-ui-shade/10 bg-white p-4">
        <TextInput
          label="Room name"
          value={title}
          action={setTitle}
          placeholder="e.g. Koramangala Café Hop"
          autoCapitalize="words"
          isInvalid={title.length > 0 && trimmedTitle.length < 3}
          errorText={
            title.length > 0 && trimmedTitle.length < 3
              ? "Use at least 3 characters."
              : undefined
          }
        />

        <View className="mt-4">
          <TextInput
            label="Description"
            value={description}
            action={setDescription}
            placeholder="Who should join this room?"
          />
        </View>

        <View className="mt-5 rounded-2xl bg-ui-shade/5 p-4">
          <View className="flex-row items-center gap-2">
            <Icon type="Ionicons" name="location-outline" size={18} />
            <Text className="font-semibold text-ui-dark">Room location</Text>
          </View>
          <Text className="mt-2 text-sm text-ui-shade/70">
            {address || coordinatesLabel}
          </Text>
          {error ? <Text className="mt-2 text-sm text-red-500">{error}</Text> : null}
        </View>

        <Button
          text={mutation.isPending ? "Creating..." : "Create and join pool"}
          className="mt-6 rounded-2xl"
          disabled={!canSubmit || mutation.isPending}
          onClick={() => mutation.mutate()}
        />
      </View>
    </ScrollView>
  );
}
