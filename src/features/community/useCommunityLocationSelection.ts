import {
  getCommunityLocationDetails,
  reverseGeocodeCommunityLocation,
  searchCommunityLocations,
} from "@/src/features/community/api";
import type { LocationPrediction, SelectedLocation } from "@/src/features/community/types";
import type { MapPressEvent, Region } from "react-native-maps";
import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_MAP_REGION: Region = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 18,
  longitudeDelta: 18,
};

const createPlacesSessionToken = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 18)}`;

const getLocationErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || error === null || !("response" in error)) return fallback;
  const data = (error as { response?: { data?: { message?: unknown } } }).response?.data;
  return typeof data?.message === "string" ? data.message : fallback;
};

export default function useCommunityLocationSelection() {
  const [query, setQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [predictions, setPredictions] = useState<LocationPrediction[]>([]);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [mapRegion, setMapRegion] = useState(DEFAULT_MAP_REGION);
  const placesSessionToken = useRef(createPlacesSessionToken());
  const requestId = useRef(0);

  useEffect(() => {
    const input = query.trim();
    if (input.length < 3 || selectedLocation) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    const currentRequestId = ++requestId.current;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError("");
      try {
        const results = await searchCommunityLocations(input, placesSessionToken.current);
        if (currentRequestId === requestId.current) setPredictions(results);
      } catch (error) {
        if (currentRequestId === requestId.current) {
          setPredictions([]);
          setSearchError(getLocationErrorMessage(error, "Could not search locations. Try again."));
        }
      } finally {
        if (currentRequestId === requestId.current) setIsSearching(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [query, selectedLocation]);

  const updateQuery = useCallback((value: string) => {
    requestId.current += 1;
    setSelectedLocation(null);
    setQuery(value);
    setPredictions([]);
    setSearchError("");
  }, []);

  const selectPlace = useCallback(async (prediction: LocationPrediction) => {
    const currentRequestId = ++requestId.current;
    setPredictions([]);
    setIsSearching(true);
    setSearchError("");
    try {
      const place = await getCommunityLocationDetails(prediction.placeId, placesSessionToken.current);
      if (currentRequestId !== requestId.current) return;
      if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) {
        throw new Error("Location coordinates were not returned");
      }
      setSelectedLocation(place);
      setQuery(place.formattedAddress);
      setMapRegion({
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      });
      placesSessionToken.current = createPlacesSessionToken();
    } catch (error) {
      if (currentRequestId === requestId.current) {
        setSearchError(getLocationErrorMessage(error, "Could not select that location. Try another result."));
      }
    } finally {
      if (currentRequestId === requestId.current) setIsSearching(false);
    }
  }, []);

  const selectMapPin = useCallback(async (event: MapPressEvent) => {
    const currentRequestId = ++requestId.current;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const pin: SelectedLocation = { latitude, longitude, formattedAddress: "Dropped pin" };
    setSelectedLocation(pin);
    setPredictions([]);
    setSearchError("");
    try {
      const formattedAddress = await reverseGeocodeCommunityLocation(latitude, longitude);
      if (currentRequestId !== requestId.current) return;
      setSelectedLocation((current) => current?.latitude === latitude && current.longitude === longitude
        ? { ...pin, formattedAddress }
        : current);
      setQuery(formattedAddress);
    } catch (error) {
      if (currentRequestId === requestId.current) {
        setSearchError(getLocationErrorMessage(error, "Pin saved, but its address could not be loaded."));
      }
    }
  }, []);

  return {
    query,
    selectedLocation,
    predictions,
    searchError,
    isSearching,
    mapRegion,
    setMapRegion,
    updateQuery,
    selectPlace,
    selectMapPin,
  };
}
