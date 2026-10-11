export default function getExploreErrorAction(error: unknown) {
  const response = (
    error as { response?: { status?: number; data?: { code?: string } } }
  )?.response;
  if (response?.status === 401) return "login";
  if (response?.data?.code === "INSUFFICIENT_CREDITS") return "credits";
  if (response?.data?.code === "INCOMPLETE_PROFILE") return "profile";
  if (response?.data?.code === "INVALID_AGE_PREFERENCE") return "preferences";
  return "retry";
}
