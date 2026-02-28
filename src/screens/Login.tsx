import { Ionicons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GOOGLE_WEB_CLIENT_ID } from "../service/config";
import useAuth from "../service/requests/auth";
import { getIsOnboarded, getUser } from "../service/storage";

export default function LoginScreen() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  const googleLoginMutation = useMutation({
    mutationFn: loginWithGoogle,
    onSuccess: () => {
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
          By signing in, you agree to our Terms & Conditions and Privacy Policy.
        </Text>
      </View>
    </ImageBackground>
  );
}
