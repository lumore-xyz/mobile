import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton";
import { LegalAgreementText } from "../components/auth/LegalAgreementText";
import { AuthScreenLayout } from "../components/layout/AuthScreenLayout";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import {
  getGoogleIdToken,
  getGoogleSignInErrorMessage,
} from "../service/google-signin";
import { useOneSignal } from "../service/providers/OneSignalProvider";
import useAuth from "../service/requests/auth";
import { getIsOnboarded, getUser } from "../service/storage";
import { triggerSelectionHaptic } from "../utils/haptics";
import { toUserFacingError } from "../utils/userFacingError";

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithCredentials, loginWithGoogle } = useAuth();
  const { checkNotificationPermission } = useOneSignal();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const canSubmit = useMemo(
    () => Boolean(identifier.trim() && password),
    [identifier, password],
  );

  const credentialLoginMutation = useMutation({
    mutationFn: loginWithCredentials,
    onSuccess: async () => {
      await checkNotificationPermission(true);
      const user = getUser();
      const isOnboarded = Boolean(getIsOnboarded(user?._id || ""));
      router.replace(isOnboarded ? "/explore" : "/(onboarding)/onboarding");
    },
    onError: (error: any) => {
      const message = toUserFacingError(
        error,
        "We couldn’t sign you in. Please check your details and try again.",
      );
      setApiError(message);
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: async () => {
      const idToken = await getGoogleIdToken();
      if (!idToken) return null;
      return loginWithGoogle(idToken);
    },
    onSuccess: async (user) => {
      if (!user) return;
      await checkNotificationPermission(true);
      const isOnboarded = Boolean(getIsOnboarded(user?._id || user?.id || ""));
      router.replace(isOnboarded ? "/explore" : "/(onboarding)/onboarding");
    },
    onError: (error: unknown) => {
      const message = getGoogleSignInErrorMessage(error);
      if (message) {
        setApiError(message);
      }
    },
  });

  const validate = () => {
    let isValid = true;

    setIdentifierError("");
    setPasswordError("");
    setApiError("");

    if (!identifier.trim()) {
      setIdentifierError("Email or username is required.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    }

    return isValid;
  };

  const handleCredentialLogin = () => {
    if (!validate()) return;

    credentialLoginMutation.mutate({
      identifier: identifier.trim(),
      password,
    });
  };

  const handleGoogleLogin = () => {
    setIdentifierError("");
    setPasswordError("");
    setApiError("");
    googleLoginMutation.mutate();
  };

  const isSubmitting =
    credentialLoginMutation.isPending || googleLoginMutation.isPending;

  return (
    <AuthScreenLayout>
      <Text className="text-2xl font-semibold text-ui-shade">Sign In</Text>
      <Text className="mt-1 text-sm text-ui-shade/70">
        Sign in with your email or username and password.
      </Text>

      <View className="mt-4 gap-3">
        <TextInput
          label="Email or Username"
          value={identifier}
          action={(value) => {
            setIdentifier(value);
            setIdentifierError("");
            setApiError("");
          }}
          placeholder="you@example.com or username"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          textContentType="username"
          isInvalid={Boolean(identifierError)}
          errorText={identifierError}
        />
        <TextInput
          label="Password"
          value={password}
          action={(value) => {
            setPassword(value);
            setPasswordError("");
            setApiError("");
          }}
          type="password"
          placeholder="Enter password"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="send"
          onSubmitEditing={handleCredentialLogin}
          isInvalid={Boolean(passwordError)}
          errorText={passwordError}
        />
        <View className="mb-1 flex flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => {
              triggerSelectionHaptic();
              router.push("/forgot-password" as any);
            }}
            className="min-h-11 justify-center"
            hitSlop={8}
          >
            <Text className="text-sm font-medium text-ui-shade underline">
              Forgot Password?
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              triggerSelectionHaptic();
              router.push("/signup" as any);
            }}
            className="min-h-11 justify-center"
            hitSlop={8}
          >
            <Text className="text-sm font-medium text-ui-shade underline">
              New here? Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {apiError ? (
          <Text className="text-sm text-red-500">{apiError}</Text>
        ) : null}
        <Button
          text={isSubmitting ? "Signing in..." : "Sign In"}
          onClick={handleCredentialLogin}
          disabled={isSubmitting || !canSubmit}
        />

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-ui-shade/10" />
          <Text className="text-xs text-ui-shade/60">or</Text>
          <View className="h-px flex-1 bg-ui-shade/10" />
        </View>

        <GoogleAuthButton
          onPress={handleGoogleLogin}
          isLoading={googleLoginMutation.isPending}
          disabled={credentialLoginMutation.isPending}
        />
      </View>
      <LegalAgreementText />
    </AuthScreenLayout>
  );
}
