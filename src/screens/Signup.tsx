import { emailSchema, passwordSchema } from "@/src/lib/validation";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
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
import { THEME } from "../libs/constants/theme";
import { triggerSelectionHaptic } from "../utils/haptics";
import { toUserFacingError } from "../utils/userFacingError";

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
    onError: (error: unknown) => {
      const message = toUserFacingError(
        error,
        "We couldn’t create your account right now. Please try again.",
      );
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
      <Text
        accessibilityRole="header"
        className="font-display text-3xl text-ui-midnight"
      >
        Make your first move
      </Text>
      <Text className="mt-2 text-base leading-6 text-ui-slate">
        Create an account, then tell us what connection looks like to you.
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
          helperText="Use at least 8 characters with a number and symbol."
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          isInvalid={Boolean(passwordError)}
          errorText={passwordError}
        />

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
          text={isSubmitting ? "Creating..." : "Create Account"}
          onClick={onSubmit}
          disabled={isSubmitting}
        />

        <View className="flex-row items-center gap-3">
          <View className="h-px flex-1 bg-ui-ink/10" />
          <Text className="text-xs text-ui-ink/60">or</Text>
          <View className="h-px flex-1 bg-ui-ink/10" />
        </View>

        <GoogleAuthButton
          text="Sign up with Google"
          onPress={handleGoogleSignup}
          isLoading={googleSignupMutation.isPending}
          disabled={signupMutation.isPending}
        />

        <Pressable
          onPress={() => {
            triggerSelectionHaptic();
            router.replace("/login");
          }}
          className="mt-1 min-h-11 justify-center self-center active:opacity-70"
          hitSlop={8}
          accessibilityRole="link"
        >
          <Text className="text-sm text-ui-slate">
            Already have an account?{" "}
            <Text className="font-semibold text-ui-forest">Sign in</Text>
          </Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
};

export default SignupScreen;
