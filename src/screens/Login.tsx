import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
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
import { THEME } from "../libs/constants/theme";
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
    onError: (error: unknown) => {
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
      <Text
        accessibilityRole="header"
        className="font-display text-3xl text-ui-midnight"
      >
        Welcome back
      </Text>
      <Text className="mt-2 text-base leading-6 text-ui-slate">
        Pick up where your last conversation left off.
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
        <View className="items-end">
          <Pressable
            onPress={() => {
              triggerSelectionHaptic();
              router.push("/forgot-password");
            }}
            className="min-h-11 justify-center active:opacity-70"
            hitSlop={8}
            accessibilityRole="link"
          >
            <Text className="text-sm font-semibold text-ui-forest">
              Forgot password?
            </Text>
          </Pressable>
        </View>

        {apiError ? (
          <View
            accessibilityRole="alert"
            className="flex-row gap-2 rounded-2xl bg-ui-danger/10 p-3"
          >
            <AlertCircle size={18} color={THEME.action.destructive} />
            <Text className="flex-1 text-sm leading-5 text-ui-danger">
              {apiError}
            </Text>
          </View>
        ) : null}
        <Button
          text={isSubmitting ? "Signing in..." : "Sign In"}
          onClick={handleCredentialLogin}
          disabled={isSubmitting || !canSubmit}
        />

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-ui-ink/10" />
          <Text className="text-xs text-ui-ink/60">or</Text>
          <View className="h-px flex-1 bg-ui-ink/10" />
        </View>

        <GoogleAuthButton
          onPress={handleGoogleLogin}
          isLoading={googleLoginMutation.isPending}
          disabled={credentialLoginMutation.isPending}
        />

        <Pressable
          onPress={() => {
            triggerSelectionHaptic();
            router.push("/signup");
          }}
          className="min-h-11 items-center justify-center active:opacity-70"
          accessibilityRole="link"
        >
          <Text className="text-sm text-ui-slate">
            New to Lumore?{" "}
            <Text className="font-semibold text-ui-forest">
              Create an account
            </Text>
          </Text>
        </Pressable>
      </View>
      <LegalAgreementText />
    </AuthScreenLayout>
  );
}
