import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { LegalAgreementText } from "../components/auth/LegalAgreementText";
import { AuthScreenLayout } from "../components/layout/AuthScreenLayout";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { useOneSignal } from "../service/providers/OneSignalProvider";
import useAuth from "../service/requests/auth";
import { getIsOnboarded, getUser } from "../service/storage";

export default function GuestLoginScreen() {
  const router = useRouter();
  const { loginWithCredentials } = useAuth();
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
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to login with credentials.";
      setApiError(message);
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

  return (
    <AuthScreenLayout
      footer={<LegalAgreementText tone="light" />}
      cardClassName="mb-2"
    >
      <Text className="text-xl font-semibold text-ui-shade">Sign In</Text>
      <Text className="mt-1 text-sm text-ui-shade/70">
        Sign in with your email or username and password.
      </Text>

      <View className="mt-4 gap-2">
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
        {apiError ? (
          <Text className="text-sm text-red-500">{apiError}</Text>
        ) : null}
        <Button
          text={credentialLoginMutation.isPending ? "Signing in..." : "Sign In"}
          onClick={handleCredentialLogin}
          disabled={credentialLoginMutation.isPending || !canSubmit}
        />
      </View>
    </AuthScreenLayout>
  );
}
