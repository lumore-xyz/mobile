import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AUTH_BACKGROUND from "@/assets/images/login-screen.webp";
import AUTH_LOGO from "@/assets/images/lumore-hr-white.webp";
import clsxLib from "clsx";

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
  const insets = useSafeAreaInsets();

  return (
    <View className="relative flex-1 overflow-hidden bg-ui-ink">
      <Image
        source={AUTH_BACKGROUND}
        resizeMode="cover"
        accessible={false}
        className="absolute inset-0 h-full w-full"
      />
      <View className="absolute inset-0 bg-ui-midnight/60" />
      <View className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="flex-grow justify-between"
          contentContainerStyle={{
            paddingTop: Math.max(insets.top, 20),
          }}
        >
          <View className="px-6 pb-8 pt-4">
            <Image
              source={AUTH_LOGO}
              accessibilityLabel="Lumore"
              resizeMode="contain"
              className="h-12 w-36"
            />
            <View className="mt-8 self-start rounded-full border border-ui-paper/25 bg-ui-ink/25 px-3 py-1.5">
              <Text className="text-xs font-semibold text-ui-paper">
                Dating with intention
              </Text>
            </View>
            <Text className="mt-3 max-w-[19rem] font-display text-3xl leading-9 text-ui-paper">
              Meet someone worth slowing down for.
            </Text>
          </View>

          <View
            className={clsxLib(
              "w-full rounded-t-[24px] border-t border-ui-paper/60 bg-ui-surface-raised px-6 pt-6",
              cardClassName,
            )}
            style={{ paddingBottom: 28 + insets.bottom }}
          >
            {children}
            {footer ? <View className="mt-4">{footer}</View> : null}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
