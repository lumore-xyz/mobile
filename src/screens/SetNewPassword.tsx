import { passwordSchema } from "@/src/lib/validation";
import { setNewPassword } from "@/src/libs/apis";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { AlertCircle } from "lucide-react-native";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { AuthScreenLayout } from "../components/layout/AuthScreenLayout";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";
import { THEME } from "../libs/constants/theme";
import { toUserFacingError } from "../utils/userFacingError";

const SetNewPasswordScreen = () => {
  const [newPassword, setNewPasswordState] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [apiError, setApiError] = useState("");

  const mutation = useMutation({
    mutationFn: setNewPassword,
    onSuccess: () => {
      router.replace("/explore");
    },
    onError: (error: unknown) => {
      const message = toUserFacingError(
        error,
        "We couldn’t set your password right now. Please try again.",
      );
      setApiError(message);
    },
  });

  const validate = () => {
    setNewPasswordError("");
    setConfirmPasswordError("");
    setApiError("");

    const parsed = passwordSchema.safeParse(newPassword);
    if (!parsed.success) {
      setNewPasswordError(
        parsed.error.issues[0]?.message || "Invalid password.",
      );
      return false;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("Both password fields must be the same.");
      return false;
    }

    return true;
  };

  const onSubmit = () => {
    if (!validate()) return;
    mutation.mutate({ newPassword });
  };

  return (
    <AuthScreenLayout>
      <Text
        accessibilityRole="header"
        className="font-display text-3xl text-ui-midnight"
      >
        Secure your account
      </Text>
      <Text className="mt-2 text-base leading-6 text-ui-slate">
        Create a password you don’t use anywhere else.
      </Text>

      <View className="mt-4 gap-3">
        <TextInput
          label="New Password"
          value={newPassword}
          action={(value) => {
            setNewPasswordState(value);
            setNewPasswordError("");
            setApiError("");
          }}
          type="password"
          placeholder="New Password"
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
          placeholder="Confirm Password"
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
        <Button
          text={mutation.isPending ? "Updating..." : "Set Password"}
          onClick={onSubmit}
          disabled={mutation.isPending}
        />
      </View>
    </AuthScreenLayout>
  );
};

export default SetNewPasswordScreen;
