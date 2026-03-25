import { emailSchema } from "@/src/lib/validation";
import { requestPasswordResetEmail } from "@/src/libs/apis";
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

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: requestPasswordResetEmail,
    onSuccess: (response) => {
      setApiError("");
      setSuccessMessage(
        response?.message ||
          "If an account exists for this email, a reset link has been sent.",
      );
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to send reset email right now. Please try again.";
      setApiError(message);
      setSuccessMessage("");
    },
  });

  const validate = () => {
    setEmailError("");
    setApiError("");
    setSuccessMessage("");

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setEmailError(
        parsed.error.issues[0]?.message || "Invalid email address.",
      );
      return false;
    }

    return true;
  };

  const onSubmit = () => {
    if (!validate()) return;
    forgotPasswordMutation.mutate(email);
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
          Forgot Password
        </Text>
        <Text className="mt-1 text-sm text-ui-shade/70">
          Enter your email and we will send you a password reset link.
        </Text>

        <View className="mt-4 gap-2">
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

          {apiError ? (
            <Text className="text-sm text-red-500">{apiError}</Text>
          ) : null}
          {successMessage ? (
            <Text className="text-sm text-green-700">{successMessage}</Text>
          ) : null}

          <Button
            text={
              forgotPasswordMutation.isPending
                ? "Sending..."
                : "Send Reset Link"
            }
            onClick={onSubmit}
            disabled={forgotPasswordMutation.isPending}
          />

          <TouchableOpacity
            onPress={() => router.replace("/login")}
            className="mt-1 self-center"
          >
            <Text className="text-sm font-medium text-ui-shade underline">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

export default ForgotPasswordScreen;
