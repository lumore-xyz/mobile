import { useMutation } from "@tanstack/react-query";
import { getGoogleIdToken, getGoogleSignInErrorMessage } from "@/src/service/google-signin";
import useAuth from "@/src/service/requests/auth";
import useCompleteAuthentication from "./useCompleteAuthentication";
import { toUserFacingError } from "@/src/utils/userFacingError";

const UNDERAGE_ACCOUNT_MESSAGE = "You must be 18 or older to use Lumore";

export default function useGoogleAuth(onError: (message: string) => void) {
  const { loginWithGoogle } = useAuth();
  const completeAuthentication = useCompleteAuthentication();

  return useMutation({
    mutationFn: async () => {
      const idToken = await getGoogleIdToken();
      if (!idToken) return null;
      return loginWithGoogle(idToken);
    },
    onSuccess: async (user) => {
      if (!user) return;
      await completeAuthentication(user._id || user.id || "");
    },
    onError: (error: unknown) => {
      const apiMessage = toUserFacingError(error, "");
      if (apiMessage === UNDERAGE_ACCOUNT_MESSAGE) {
        onError(
          "Lumore is for adults 18 and older. This account’s saved birthday shows it may be under 18. If that’s incorrect, contact Lumore support to review your account.",
        );
        return;
      }
      if (apiMessage) {
        onError(apiMessage);
        return;
      }

      const message = getGoogleSignInErrorMessage(error);
      if (message) onError(message);
    },
  });
}
