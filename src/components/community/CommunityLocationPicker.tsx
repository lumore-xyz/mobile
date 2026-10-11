import { TextInput } from "@/src/components/ui/TextInput";
import type {
  LocationPrediction,
  SelectedLocation,
} from "@/src/features/community/types";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import Constants from "expo-constants";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type MapPressEvent,
  type Region,
} from "react-native-maps";
import React from "react";
import { Platform, Pressable, Text, View } from "react-native";

interface CommunityLocationPickerProps {
  query: string;
  selectedLocation: SelectedLocation | null;
  predictions: LocationPrediction[];
  searchError: string;
  isSearching: boolean;
  mapRegion: Region;
  onQueryChange: (query: string) => void;
  onSelectPlace: (prediction: LocationPrediction) => void;
  onMapPress: (event: MapPressEvent) => void;
  onMapRegionChange: (region: Region) => void;
}

const hasMapKey = Boolean(Constants.expoConfig?.extra?.googleMapsConfigured);

const CommunityLocationPicker = ({
  query,
  selectedLocation,
  predictions,
  searchError,
  isSearching,
  mapRegion,
  onQueryChange,
  onSelectPlace,
  onMapPress,
  onMapRegionChange,
}: CommunityLocationPickerProps) => (
  <View className="rounded-[24px] bg-ui-midnight p-4">
    <View className="flex-row items-start gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-champagne">
        <Icon
          name={selectedLocation ? "MapPin" : "Search"}
          size={18}
          color={COLORS.ink}
        />
      </View>
      <View className="flex-1">
        <Text className="font-bold text-ui-paper">Choose a place</Text>
        <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
          Search for a city, neighborhood, or address.
        </Text>
      </View>
    </View>

    <TextInput
      label=""
      compact
      labelTextClassName="text-ui-paper"
      value={query}
      action={onQueryChange}
      placeholder="e.g. Koregaon Park, Pune"
      autoCapitalize="words"
      autoCorrect={false}
    />
    {isSearching ? (
      <Text className="mt-2 text-sm text-ui-paper/70">Searching…</Text>
    ) : null}
    {searchError ? (
      <Text className="mt-2 text-sm text-ui-paper">{searchError}</Text>
    ) : null}
    {predictions.map((prediction) => (
      <Pressable
        key={prediction.placeId}
        accessibilityRole="button"
        accessibilityLabel={`Choose ${prediction.description}`}
        onPress={() => onSelectPlace(prediction)}
        className="mt-2 rounded-2xl bg-ui-paper px-4 py-3 active:opacity-75"
      >
        <Text className="font-semibold text-ui-ink">
          {prediction.primaryText}
        </Text>
        {prediction.secondaryText ? (
          <Text className="mt-0.5 text-sm text-ui-slate">
            {prediction.secondaryText}
          </Text>
        ) : null}
      </Pressable>
    ))}

    {hasMapKey && Platform.OS === "android" ? (
      <View className="mt-4 overflow-hidden rounded-2xl">
        <Text className="mb-2 text-sm font-semibold text-ui-paper">
          Or tap the map to drop a pin
        </Text>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ height: 240 }}
          region={mapRegion}
          onRegionChangeComplete={onMapRegionChange}
          onPress={onMapPress}
          accessibilityLabel="Choose community location on map"
        >
          {selectedLocation ? (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
            />
          ) : null}
        </MapView>
      </View>
    ) : (
      <Text className="mt-3 text-xs leading-5 text-ui-paper/70">
        {selectedLocation
          ? `Selected place: ${selectedLocation.formattedAddress}`
          : "Choose a search result to set the community location."}
      </Text>
    )}
  </View>
);

export default CommunityLocationPicker;
