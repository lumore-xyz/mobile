import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import useGoogleAuth from "@/src/features/authentication/useGoogleAuth";
import useCompleteAuthentication from "@/src/features/authentication/useCompleteAuthentication";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton";
import AuthMethodDivider from "../components/auth/AuthMethodDivider";
import { LegalAgreementText } from "../components/auth/LegalAgreementText";
import { AuthScreenLayout } from "../components/layout/AuthScreenLayout";
import Button from "../components/ui/Button";
import InlineErrorNotice from "../components/ui/InlineErrorNotice";
import { TextInput } from "../components/ui/TextInput";
import useAuth from "../service/requests/auth";
import { getUser } from "../service/storage";
import { triggerSelectionHaptic } from "../utils/haptics";
import { toUserFacingError } from "../utils/userFacingError";

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithCredentials } = useAuth();
  const completeAuthentication = useCompleteAuthentication();

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
      const user = getUser();
      await completeAuthentication(user?._id || "");
    },
    onError: (error: unknown) => {
      const message = toUserFacingError(
        error,
        "We couldn’t sign you in. Please check your details and try again.",
      );
      setApiError(message);
    },
  });

  const googleLoginMutation = useGoogleAuth(setApiError);

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

        <InlineErrorNotice message={apiError} />
        <Button
          text={isSubmitting ? "Signing in..." : "Sign In"}
          onClick={handleCredentialLogin}
          disabled={isSubmitting || !canSubmit}
        />

        <AuthMethodDivider />

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
