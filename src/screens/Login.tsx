import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Image,
  ImageBackground,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import config from "../service/config";
import { useOneSignal } from "../service/providers/OneSignalProvider";
import useAuth from "../service/requests/auth";
import { getIsOnboarded, getUser } from "../service/storage";

export default function LoginScreen() {
  const termsUrl = "https://www.lumore.xyz/terms-of-use";
  const privacyUrl = "https://www.lumore.xyz/privacy-policy";
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const { checkNotificationPermission } = useOneSignal();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: config.GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: async () => {
      await checkNotificationPermission(true);
      const user = getUser();
      const isOnboarded = Boolean(getIsOnboarded(user?._id || ""));
      router.replace(isOnboarded ? "/explore" : "/(onboarding)/onboarding");
    },
    onError: (error) => {
      console.error("Login with google failed ", error);
    },
  });

  const handleGoogleSignin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      googleLoginMutation.mutate(response.data?.idToken as string);
    } catch (error) {
      console.error("Google signin error ", error);
    }
  };

  const handleOpenExternalUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Failed to open external URL", error);
    }
  };

  return (
    <ImageBackground
      source={require("@/assets/images/login-screen.webp")}
      className="flex-1 justify-end items-center bg-cover bg-center overflow-hidden p-6"
    >
      <TouchableOpacity
        onPress={() => router.push("/guest-login" as any)}
        className="absolute right-6 top-6 z-10 rounded-full border border-ui-light/60 bg-ui-dark/35 px-4 py-2"
      >
        <Text className="text-sm font-semibold text-ui-light">Guest Login</Text>
      </TouchableOpacity>

      <Image
        source={require("@/assets/images/lumore-hr-white.png")}
        alt="Lumore"
        className="h-[4.5rem] w-40 object-contain"
      />

      {/* Google Login Button */}
      <TouchableOpacity
        onPress={handleGoogleSignin}
        disabled={googleLoginMutation.isPending}
        className="w-full mt-6 flex flex-row gap-2 items-center justify-center bg-ui-light border border-ui-shade py-3 rounded-xl"
      >
        <Ionicons name="logo-google" size={18} />
        <Text className="text-center text-ui-shade font-semibold text-lg">
          {googleLoginMutation.isPending
            ? "Signing in..."
            : "Sign in with Google"}
        </Text>
      </TouchableOpacity>

      <View>
        <Text className="text-center mt-4 text-ui-light">
          By signing in, you agree to our{" "}
          <Text
            className="underline"
            onPress={() => {
              void handleOpenExternalUrl(termsUrl);
            }}
          >
            Terms & Conditions
          </Text>{" "}
          and{" "}
          <Text
            className="underline"
            onPress={() => {
              void handleOpenExternalUrl(privacyUrl);
            }}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </View>
    </ImageBackground>
  );
}
