import type { LocationWritePayload } from "@/src/features/location/types";
import apiClient from "@/src/service/api-client";
import { getUser } from "@/src/service/storage";
import axios from "axios";

export const getFormattedAddress = async (latitude: number, longitude: number) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
  const response = await axios.get(url, {
    headers: { "User-Agent": "Lumore/1.0" },
  });
  return response.data.display_name || null;
};

export const updateUserLocation = async (data: LocationWritePayload) => {
  const { _id: userId } = getUser();
  const response = await apiClient.post(`/profile/${userId}/update-location`, {
    latitude: data.latitude,
    longitude: data.longitude,
    formattedAddress: data.formattedAddress || undefined,
  });
  return response.data;
};
