import { getFormattedAddress, updateUserLocation } from "@/src/features/location/api";
import type { LocationWritePayload } from "@/src/features/location/types";
import { hasSignificantLocationChange } from "@/src/libs/locationSync";
import { useMutation } from "@tanstack/react-query";
import * as Location from "expo-location";
import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getUser } from "../storage";
import { LocationContext } from "@/src/service/context/LocationContext";

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const userId = getUser()?._id || null;
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentFix, setCurrentFix] = useState<LocationWritePayload | null>(null);
  const lastSentLocation = useRef<LocationWritePayload | null>(null);

  const { mutate: saveLocation } = useMutation({
    mutationFn: (locationData: LocationWritePayload) =>
      updateUserLocation(locationData),
  });
  const contextValue = useMemo(
    () => ({ latitude, longitude, error }),
    [latitude, longitude, error],
  );

  useEffect(() => {
    if (!userId) {
      lastSentLocation.current = null;
      setLatitude(null);
      setLongitude(null);
      setCurrentFix(null);
      setError(null);
      return;
    }

    let watchSubscription: Location.LocationSubscription | null = null;
    let isUnmounted = false;
    setError(null);

    const syncLocation = async (nextLatitude: number, nextLongitude: number) => {
      let nextFormattedAddress: string | null = null;

      try {
        nextFormattedAddress = await getFormattedAddress(nextLatitude, nextLongitude);
      } catch (locationError) {
        console.error("Error fetching address:", locationError);
      }

      if (isUnmounted) return;

      setLatitude(nextLatitude);
      setLongitude(nextLongitude);
      setCurrentFix({
        latitude: nextLatitude,
        longitude: nextLongitude,
        formattedAddress: nextFormattedAddress,
      });
    };

    const startTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          if (!isUnmounted) {
            setError("Location permission is required to find nearby matches.");
          }
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        await syncLocation(current.coords.latitude, current.coords.longitude);

        watchSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 60_000,
            distanceInterval: 100,
          },
          (position) => {
            void syncLocation(position.coords.latitude, position.coords.longitude);
          },
        );
      } catch {
        if (!isUnmounted) {
          setError("Unable to access current location.");
        }
      }
    };

    void startTracking();

    return () => {
      isUnmounted = true;
      watchSubscription?.remove();
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !currentFix) return;
    if (!hasSignificantLocationChange(lastSentLocation.current, currentFix)) return;

    lastSentLocation.current = currentFix;
    saveLocation(currentFix);
  }, [currentFix, saveLocation, userId]);

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};
