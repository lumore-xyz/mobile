import React from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  View,
} from "react-native";

const AUTH_BACKGROUND = require("@/assets/images/login-screen.webp");
const AUTH_LOGO = require("@/assets/images/lumore-hr-white.png");

const joinClassNames = (...classNames: (string | undefined)[]) =>
  classNames.filter(Boolean).join(" ");

interface AuthScreenLayoutProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  cardClassName?: string;
}

export const AuthScreenLayout: React.FC<AuthScreenLayoutProps> = ({
  children,
  footer,
  cardClassName,
}) => {
  return (
    <ImageBackground
      source={AUTH_BACKGROUND}
      resizeMode="cover"
      className="flex-1 overflow-hidden bg-ui-shade"
    >
      <View className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-grow items-center justify-end pt-10"
        >
          <Image
            source={AUTH_LOGO}
            alt="Lumore"
            resizeMode="contain"
            className="h-[4.5rem] w-40 object-contain"
          />

          <View
            className={joinClassNames(
              "mt-6 w-full rounded-t-3xl border border-ui-light/40 bg-ui-light/95 p-6",
              cardClassName,
            )}
          >
            {children}
          </View>

          {footer ? <View className="px-6 pb-4">{footer}</View> : null}
        </ScrollView>
      </View>
    </ImageBackground>
  );
};
