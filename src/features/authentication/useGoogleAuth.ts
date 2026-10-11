import { useMutation } from "@tanstack/react-query";
import { getGoogleIdToken, getGoogleSignInErrorMessage } from "@/src/service/google-signin";
import useAuth from "@/src/service/requests/auth";
import useCompleteAuthentication from "./useCompleteAuthentication";

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
      const message = getGoogleSignInErrorMessage(error);
      if (message) onError(message);
    },
  });
}
