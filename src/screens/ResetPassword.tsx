import { passwordSchema } from "@/src/lib/validation";
import { resetPasswordWithToken } from "@/src/libs/apis";
import { useMutation } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Button from "../components/ui/Button";
import { TextInput } from "../components/ui/TextInput";

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
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to reset password right now. Please try again.";
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
      setApiError("Reset token is missing or invalid.");
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
          Reset Password
        </Text>
        <Text className="mt-1 text-sm text-ui-shade/70">
          {email
            ? `Create a new password for ${email}.`
            : "Create a new password for your account."}
        </Text>

        <View className="mt-4 gap-2">
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
            isInvalid={Boolean(confirmPasswordError)}
            errorText={confirmPasswordError}
          />

          {apiError ? (
            <Text className="text-sm text-red-500">{apiError}</Text>
          ) : null}
          {successMessage ? (
            <Text className="text-sm text-green-700">{successMessage}</Text>
          ) : null}

          <Button
            text={
              resetPasswordMutation.isPending ? "Updating..." : "Reset Password"
            }
            onClick={onSubmit}
            disabled={resetPasswordMutation.isPending || !token}
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

export default ResetPasswordScreen;
