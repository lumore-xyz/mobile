import { passwordSchema } from "@/src/lib/validation";
import { setNewPassword } from "@/src/libs/apis";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";

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
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        "Unable to set password right now. Please try again.";
      setApiError(message);
    },
  });

  const hasError = useMemo(
    () => Boolean(newPasswordError || confirmPasswordError || apiError),
    [newPasswordError, confirmPasswordError, apiError],
  );

  const validate = () => {
    setNewPasswordError("");
    setConfirmPasswordError("");
    setApiError("");

    const parsed = passwordSchema.safeParse(newPassword);
    if (!parsed.success) {
      setNewPasswordError(parsed.error.issues[0]?.message || "Invalid password.");
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
    <View className="flex-1 bg-ui-light px-4 py-8 justify-center">
      <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
        <Text className="text-2xl font-semibold text-ui-shade">
          Set New Password
        </Text>
        <Text className="mt-2 text-sm text-ui-shade/70">
          Please create a strong password for your account.
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
            isInvalid={Boolean(confirmPasswordError)}
            errorText={confirmPasswordError}
          />
          {hasError ? (
            <Text className="text-sm text-red-500">{apiError}</Text>
          ) : null}
          <Button
            text={mutation.isPending ? "Updating..." : "Set Password"}
            onClick={onSubmit}
            disabled={mutation.isPending}
          />
        </View>
      </View>
    </View>
  );
};

export default SetNewPasswordScreen;
