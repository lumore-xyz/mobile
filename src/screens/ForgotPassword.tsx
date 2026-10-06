import { emailSchema } from "@/src/lib/validation";
import { requestPasswordResetEmail } from "@/src/libs/apis";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { AlertCircle, CheckCircle2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AuthScreenLayout } from "../components/layout/AuthScreenLayout";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { triggerSelectionHaptic } from "../utils/haptics";
import { toUserFacingError } from "../utils/userFacingError";
import { THEME } from "../libs/constants/theme";

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
    onError: (error: unknown) => {
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
      <Text
        accessibilityRole="header"
        className="font-display text-3xl text-ui-midnight"
      >
        Find your way back
      </Text>
      <Text className="mt-2 text-base leading-6 text-ui-slate">
        Enter your email and we’ll send a secure reset link.
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
        {successMessage ? (
          <View
            accessibilityRole="alert"
            className="flex-row gap-2 rounded-2xl bg-ui-forest/10 p-3"
          >
            <CheckCircle2 size={18} color={THEME.action.premium} />
            <Text className="flex-1 text-sm leading-5 text-ui-midnight">
              {successMessage}
            </Text>
          </View>
        ) : null}

        <Button
          text={
            forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"
          }
          onClick={onSubmit}
          disabled={forgotPasswordMutation.isPending}
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
          <Text className="text-sm font-semibold text-ui-forest">
            Back to sign in
          </Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
};

export default ForgotPasswordScreen;
