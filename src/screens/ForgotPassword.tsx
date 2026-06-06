import { emailSchema } from "@/src/lib/validation";
import { requestPasswordResetEmail } from "@/src/libs/apis";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { AuthScreenLayout } from "../components/layout/AuthScreenLayout";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { triggerSelectionHaptic } from "../utils/haptics";
import { toUserFacingError } from "../utils/userFacingError";

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
      const message = toUserFacingError(
        error,
        "We couldn’t send the reset email right now. Please try again.",
      );
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
    <AuthScreenLayout>
      <Text className="text-2xl font-semibold text-ui-shade">
        Forgot Password
      </Text>
      <Text className="mt-1 text-sm text-ui-shade/70">
        Enter your email and we will send you a password reset link.
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
          returnKeyType="send"
          onSubmitEditing={onSubmit}
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
            forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"
          }
          onClick={onSubmit}
          disabled={forgotPasswordMutation.isPending}
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
            Back to Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </AuthScreenLayout>
  );
};

export default ForgotPasswordScreen;
