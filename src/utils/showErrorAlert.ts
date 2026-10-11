import { Alert } from "react-native";

import { toUserFacingError } from "./userFacingError";

export default function showErrorAlert(
  title: string,
  error: unknown,
  fallback = "Please try again in a moment.",
): void {
  Alert.alert(title, toUserFacingError(error, fallback));
}
