import {
  getFormattedAddress,
  type LocationWritePayload,
  updateUserLocation,
} from "@/src/libs/apis";
import { hasSignificantLocationChange } from "@/src/libs/locationSync";
import { useMutation } from "@tanstack/react-query";
import * as Location from "expo-location";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getUser } from "../storage";

interface LocationContextType {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

type FullAddressPart =
  | "area"
  | "subregion"
  | "district"
  | "state"
  | "pin"
  | "country";

interface ParsedAddress {
  area?: string;
  subregion?: string;
  district?: string;
  state?: string;
  pin?: string;
  country?: string;
}

export function extractFullAddressParts(
  address: string,
  parts: FullAddressPart[] = [
    "area",
    "subregion",
    "district",
    "state",
    "pin",
    "country",
  ]
): ParsedAddress {
  const result: ParsedAddress = {};
  const segments = address.split(",").map((s) => s.trim());

  // Reverse for easy positional matching from end
  const reversed = [...segments].reverse();

  const country = reversed[0] || "";
  const pin = reversed[1] || "";
  const state = reversed[2] || "";
  const district = reversed[3] || "";
  const subregion = reversed[4] || "";
  const area = reversed[5] || "";

  if (parts.includes("country")) result.country = country;
  if (parts.includes("pin")) result.pin = pin;
  if (parts.includes("state")) result.state = state;
  if (parts.includes("district")) result.district = district;
  if (parts.includes("subregion")) result.subregion = subregion;
  if (parts.includes("area")) result.area = area;

  return result;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const userId = getUser()?._id || null;
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentFix, setCurrentFix] = useState<LocationWritePayload | null>(null);
  const lastSentLocation = useRef<LocationWritePayload | null>(null);

  const locationMutation = useMutation({
    mutationFn: (locationData: LocationWritePayload) =>
      updateUserLocation(locationData),
  });

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
    locationMutation.mutate(currentFix);
  }, [currentFix, locationMutation, userId]);

  return (
    <LocationContext.Provider value={{ latitude, longitude, error }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
};
