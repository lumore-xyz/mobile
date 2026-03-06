import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { useOneSignal } from "../service/providers/OneSignalProvider";
import useAuth from "../service/requests/auth";
import { getIsOnboarded, getUser } from "../service/storage";

export default function GuestLoginScreen() {
  const termsUrl = "https://www.lumore.xyz/terms-of-use";
  const privacyUrl = "https://www.lumore.xyz/privacy-policy";
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

  const handleOpenExternalUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open external URL", error);
    }
  };

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
    <ImageBackground
      source={require("@/assets/images/login-screen.webp")}
      className="flex-1 justify-end items-center bg-cover bg-center overflow-hidden p-6"
    >
      <TouchableOpacity
        onPress={() => router.replace("/login")}
        className="absolute right-4 top-4 z-10 rounded-full border border-ui-light/60 bg-ui-dark/35 px-4 py-2"
      >
        <Text className="text-sm font-semibold text-ui-light">Google Login</Text>
      </TouchableOpacity>

      <Image
        source={require("@/assets/images/lumore-hr-white.png")}
        alt="Lumore"
        className="h-[4.5rem] w-40 object-contain"
      />

      <View className="mt-6 w-full rounded-2xl border border-ui-light/40 bg-ui-light/95 p-4">
        <Text className="text-xl font-semibold text-ui-shade">Guest Login</Text>
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
            isInvalid={Boolean(passwordError)}
            errorText={passwordError}
          />
          {apiError ? <Text className="text-sm text-red-500">{apiError}</Text> : null}
          <Button
            text={credentialLoginMutation.isPending ? "Signing in..." : "Sign In"}
            onClick={handleCredentialLogin}
            disabled={credentialLoginMutation.isPending || !canSubmit}
          />
        </View>
      </View>

      <View>
        <Text className="text-center mt-4 text-ui-light">
          By signing in, you agree to our{" "}
          <Text
            className="underline"
            onPress={() => {
              void handleOpenExternalUrl(termsUrl);
            }}
          >
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text
            className="underline"
            onPress={() => {
              void handleOpenExternalUrl(privacyUrl);
            }}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </ImageBackground>
  );
}
