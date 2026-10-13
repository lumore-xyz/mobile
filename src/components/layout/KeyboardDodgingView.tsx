import React from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

interface KeyboardDodgingViewProps {
  children: React.ReactNode;
}

export const KeyboardDodgingView = ({ children }: KeyboardDodgingViewProps) =>
  Platform.OS === "ios" ? (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      {children}
    </KeyboardAvoidingView>
  ) : (
    <View style={{ flex: 1 }}>{children}</View>
  );
