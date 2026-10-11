import React from "react";
import { KeyboardAvoidingView, Platform } from "react-native";

interface KeyboardDodgingViewProps {
  children: React.ReactNode;
}

export const KeyboardDodgingView = ({ children }: KeyboardDodgingViewProps) => (
  <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
  >
    {children}
  </KeyboardAvoidingView>
);
