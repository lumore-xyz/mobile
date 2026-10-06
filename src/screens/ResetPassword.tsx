import { passwordSchema } from "@/src/lib/validation";
import { resetPasswordWithToken } from "@/src/libs/apis";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircle, CheckCircle2 } from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AuthScreenLayout } from "../components/layout/AuthScreenLayout";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { triggerSelectionHaptic } from "../utils/haptics";
import { toUserFacingError } from "../utils/userFacingError";
import { THEME } from "../libs/constants/theme";

const resolveQueryValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] || "" : String(value || "");

const ResetPasswordScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    token?: string | string[];
    email?: string | string[];
  }>();

  const token = useMemo(
    () => resolveQueryValue(params.token).trim(),
    [params.token],
  );
  const email = useMemo(
    () => resolveQueryValue(params.email).trim(),
    [params.email],
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordWithToken,
    onSuccess: (response) => {
      setApiError("");
      setSuccessMessage(
        response?.message ||
          "Password reset successful. You can now log in with your new password.",
      );
      setTimeout(() => {
        router.replace("/login");
      }, 1200);
    },
    onError: (error: unknown) => {
      const message = toUserFacingError(
        error,
        "We couldn’t reset your password right now. Please try again.",
      );
      setApiError(message);
      setSuccessMessage("");
    },
  });

  const validate = () => {
    setNewPasswordError("");
    setConfirmPasswordError("");
    setApiError("");
    setSuccessMessage("");

    if (!token) {
      setApiError(
        "This reset link is missing or expired. Please request a new one.",
      );
      return false;
    }

    const parsed = passwordSchema.safeParse(newPassword);
    if (!parsed.success) {
      setNewPasswordError(
        parsed.error.issues[0]?.message || "Invalid password.",
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Both password fields must match.");
      return false;
    }

    return true;
  };

  const onSubmit = () => {
    if (!validate()) return;

    resetPasswordMutation.mutate({
      token,
      newPassword,
    });
  };

  return (
    <AuthScreenLayout>
      <Text
        accessibilityRole="header"
        className="font-display text-3xl text-ui-midnight"
      >
        Choose a fresh password
      </Text>
      <Text className="mt-2 text-base leading-6 text-ui-slate">
        {email
          ? `Create a new password for ${email}.`
          : "Create a new password for your account."}
      </Text>

      <View className="mt-4 gap-3">
        <TextInput
          label="New Password"
          value={newPassword}
          action={(value) => {
            setNewPassword(value);
            setNewPasswordError("");
            setApiError("");
          }}
          type="password"
          placeholder="Enter new password"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          helperText="Use at least 8 characters with a number and symbol."
          isInvalid={Boolean(newPasswordError)}
          errorText={newPasswordError}
        />

        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          action={(value) => {
            setConfirmPassword(value);
            setConfirmPasswordError("");
            setApiError("");
          }}
          type="password"
          placeholder="Confirm new password"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          isInvalid={Boolean(confirmPasswordError)}
          errorText={confirmPasswordError}
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
            resetPasswordMutation.isPending ? "Updating..." : "Reset Password"
          }
          onClick={onSubmit}
          disabled={resetPasswordMutation.isPending || !token}
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

export default ResetPasswordScreen;
