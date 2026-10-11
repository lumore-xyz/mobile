import { createContext } from "react";

export interface LocationContextValue {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
}

export const LocationContext = createContext<LocationContextValue | undefined>(
  undefined,
);
