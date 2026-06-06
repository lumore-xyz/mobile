import config from "@/src/service/config";
import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";

let isGoogleSigninConfigured = false;

export const configureGoogleSignIn = () => {
  if (isGoogleSigninConfigured) return;

  GoogleSignin.configure({
    webClientId: config.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
    profileImageSize: 120,
  });
  isGoogleSigninConfigured = true;
};

export const getGoogleIdToken = async () => {
  configureGoogleSignIn();
  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });

  const response = await GoogleSignin.signIn();
  if (isCancelledResponse(response)) {
    return null;
  }

  if (!isSuccessResponse(response)) {
    throw new Error("Google sign-in was not completed.");
  }

  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("Google sign-in could not be completed.");
  }

  return idToken;
};

export const getGoogleSignInErrorMessage = (error: unknown) => {
  if (!isErrorWithCode(error)) {
    return error instanceof Error
      ? "We couldn’t sign you in with Google. Please try again."
      : "We couldn’t sign you in with Google. Please try again.";
  }

  switch (error.code) {
    case statusCodes.IN_PROGRESS:
      return "Google sign-in is already open. Please finish that first.";
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return "Please update Google Play Services, then try again.";
    case statusCodes.SIGN_IN_CANCELLED:
      return "";
    default:
      return "We couldn’t sign you in with Google. Please try again.";
  }
};

export const signOutFromGoogle = async () => {
  configureGoogleSignIn();
  try {
    await GoogleSignin.signOut();
  } catch {
    // Session cleanup should not fail if Google has no active session.
  }
};
