import { getFormattedAddress, updateUserData } from "@/src/libs/apis";
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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [formattedAddress, setFormattedAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastSentLocation = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: (locationData: { latitude: number; longitude: number }) =>
      updateUserData({
        location: {
          type: "Point",
          coordinates: [locationData.longitude, locationData.latitude],
          formattedAddress,
        },
      }),
  });

  useEffect(() => {
    let watchSubscription: Location.LocationSubscription | null = null;
    let isUnmounted = false;

    const syncLocation = async (nextLatitude: number, nextLongitude: number) => {
      try {
        const formatted = await getFormattedAddress(nextLatitude, nextLongitude);
        if (isUnmounted) return;

        setLatitude(nextLatitude);
        setLongitude(nextLongitude);
        setFormattedAddress(formatted);
      } catch (error) {
        console.error("Error fetching address:", error);
      }
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
  }, []);

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      const hasSignificantChange =
        !lastSentLocation.current ||
        Math.abs(lastSentLocation.current.latitude - latitude) > 1 ||
        Math.abs(lastSentLocation.current.longitude - longitude) > 1;

      if (hasSignificantChange) {
        lastSentLocation.current = { latitude, longitude };
        mutation.mutate({ latitude, longitude });
      }
    }
  }, [latitude, longitude, mutation]);

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
