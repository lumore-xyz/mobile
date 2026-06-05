import { emailSchema, passwordSchema } from "@/src/lib/validation";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { GoogleAuthButton } from "../components/auth/GoogleAuthButton";
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

const SignupScreen = () => {
  const router = useRouter();
  const { loginWithGoogle, signupWithCredentials } = useAuth();
  const { checkNotificationPermission } = useOneSignal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const signupMutation = useMutation({
    mutationFn: signupWithCredentials,
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
        "Unable to create account right now.";
      setApiError(message);
    },
  });

  const googleSignupMutation = useMutation({
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
    setEmailError("");
    setPasswordError("");
    setApiError("");

    const parsedEmail = emailSchema.safeParse(email);
    if (!parsedEmail.success) {
      setEmailError(parsedEmail.error.issues[0]?.message || "Invalid email.");
      return false;
    }

    const parsedPassword = passwordSchema.safeParse(password);
    if (!parsedPassword.success) {
      setPasswordError(
        parsedPassword.error.issues[0]?.message || "Invalid password.",
      );
      return false;
    }

    return true;
  };

  const onSubmit = () => {
    if (!validate()) return;

    signupMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  const handleGoogleSignup = () => {
    setEmailError("");
    setPasswordError("");
    setApiError("");
    googleSignupMutation.mutate();
  };

  const isSubmitting =
    signupMutation.isPending || googleSignupMutation.isPending;

  return (
    <AuthScreenLayout>
      <Text className="text-2xl font-semibold text-ui-shade">
        Create Account
      </Text>
      <Text className="mt-1 text-sm text-ui-shade/70">
        Sign up with your email and password.
      </Text>

      <View className="mt-4 gap-3">
        <TextInput
          label="Email"
          value={email}
          action={(value) => {
            setEmail(value);
            setEmailError("");
            setApiError("");
          }}
          placeholder="you@example.com"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          isInvalid={Boolean(emailError)}
          errorText={emailError}
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
          placeholder="Create a strong password"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          isInvalid={Boolean(passwordError)}
          errorText={passwordError}
        />

        {apiError ? (
          <Text className="text-sm text-red-500">{apiError}</Text>
        ) : null}

        <Button
          text={isSubmitting ? "Creating..." : "Create Account"}
          onClick={onSubmit}
          disabled={isSubmitting}
        />

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-ui-shade/10" />
          <Text className="text-xs text-ui-shade/60">or</Text>
          <View className="h-px flex-1 bg-ui-shade/10" />
        </View>

        <GoogleAuthButton
          text="Sign up with Google"
          onPress={handleGoogleSignup}
          isLoading={googleSignupMutation.isPending}
          disabled={signupMutation.isPending}
        />

        <TouchableOpacity
          onPress={() => {
            triggerSelectionHaptic();
            router.replace("/login");
          }}
          className="mt-1 min-h-11 justify-center self-center"
          hitSlop={8}
        >
          <Text className="text-sm font-medium text-ui-shade underline">
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenLayout>
  );
};

export default SignupScreen;
