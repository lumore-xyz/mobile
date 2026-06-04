import { checkUsernameAvailability } from "@/src/libs/apis";
import { useEffect, useMemo, useState } from "react";

export type UsernameAvailabilityStatus =
  | "idle"
  | "invalid"
  | "current"
  | "checking"
  | "available"
  | "taken"
  | "error";

interface UsernameAvailabilityState {
  status: UsernameAvailabilityStatus;
  message: string;
}

interface UseUsernameAvailabilityOptions {
  username: string;
  currentUsername?: string;
  enabled?: boolean;
  debounceMs?: number;
}

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

const getUsernameFormatError = (username: string) => {
  if (!username) return "Username is required.";
  if (username.length < 3) return "Username must be at least 3 characters.";
  if (username.length > 30) return "Username must be at most 30 characters.";
  if (!USERNAME_PATTERN.test(username)) {
    return "Use only letters, numbers, and underscores.";
  }
  return "";
};

export const useUsernameAvailability = ({
  username,
  currentUsername,
  enabled = true,
  debounceMs = 500,
}: UseUsernameAvailabilityOptions) => {
  const normalizedUsername = useMemo(
    () => String(username || "").trim(),
    [username],
  );
  const normalizedCurrentUsername = useMemo(
    () => String(currentUsername || "").trim(),
    [currentUsername],
  );
  const [state, setState] = useState<UsernameAvailabilityState>({
    status: "idle",
    message: "Choose a unique username.",
  });

  useEffect(() => {
    if (!enabled) {
      setState({ status: "idle", message: "" });
      return;
    }

    const formatError = getUsernameFormatError(normalizedUsername);
    if (formatError) {
      setState({ status: "invalid", message: formatError });
      return;
    }

    if (
      normalizedCurrentUsername &&
      normalizedUsername === normalizedCurrentUsername
    ) {
      setState({
        status: "current",
        message: "This is your current username.",
      });
      return;
    }

    let isCancelled = false;
    setState({
      status: "checking",
      message: "Checking username availability...",
    });

    const timeoutId = setTimeout(async () => {
      try {
        const isAvailable = await checkUsernameAvailability(normalizedUsername);
        if (isCancelled) return;

        setState(
          isAvailable
            ? {
                status: "available",
                message: "Username is available.",
              }
            : {
                status: "taken",
                message: "Username is already taken.",
              },
        );
      } catch {
        if (isCancelled) return;
        setState({
          status: "error",
          message: "Unable to check availability right now.",
        });
      }
    }, debounceMs);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [debounceMs, enabled, normalizedCurrentUsername, normalizedUsername]);

  return {
    ...state,
    normalizedUsername,
    canSubmit:
      state.status === "available" || state.status === "current" || !enabled,
    isChecking: state.status === "checking",
  };
};
