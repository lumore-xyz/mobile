import { emailSchema, passwordSchema } from "@/src/lib/validation";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { useOneSignal } from "../service/providers/OneSignalProvider";
import useAuth from "../service/requests/auth";
import { getIsOnboarded, getUser } from "../service/storage";

const SignupScreen = () => {
  const router = useRouter();
  const { signupWithCredentials } = useAuth();
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

  return (
    <ImageBackground
      source={require("@/assets/images/login-screen.webp")}
      className="flex-1 justify-end items-center bg-cover bg-center overflow-hidden p-6"
    >
      <Image
        source={require("@/assets/images/lumore-hr-white.png")}
        alt="Lumore"
        className="h-[4.5rem] w-40 object-contain"
      />

      <View className="mt-6 w-full rounded-2xl border border-ui-light/40 bg-ui-light/95 p-4">
        <Text className="text-2xl font-semibold text-ui-shade">
          Create Account
        </Text>
        <Text className="mt-1 text-sm text-ui-shade/70">
          Sign up with your email and password.
        </Text>

        <View className="mt-4 gap-0">
          <TextInput
            label="Email"
            value={email}
            action={(value) => {
              setEmail(value);
              setEmailError("");
              setApiError("");
            }}
            placeholder="you@example.com"
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
            isInvalid={Boolean(passwordError)}
            errorText={passwordError}
          />

          {apiError ? (
            <Text className="text-sm text-red-500">{apiError}</Text>
          ) : null}

          <Button
            text={signupMutation.isPending ? "Creating..." : "Create Account"}
            onClick={onSubmit}
            disabled={signupMutation.isPending}
          />

          <TouchableOpacity
            onPress={() => router.replace("/login")}
            className="mt-1 self-center"
          >
            <Text className="text-sm font-medium text-ui-shade underline">
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default SignupScreen;
