import React from "react";
import { Linking, Text } from "react-native";

const TERMS_URL = "https://www.lumore.xyz/terms-of-use";
const PRIVACY_URL = "https://www.lumore.xyz/privacy-policy";

interface LegalAgreementTextProps {
  tone?: "dark" | "light";
}

export const LegalAgreementText: React.FC<LegalAgreementTextProps> = ({
  tone = "dark",
}) => {
  const textColor = tone === "light" ? "text-ui-paper" : "text-ui-ink";

  const openExternalUrl = (url: string) => {
    void Linking.openURL(url).catch(() => {});
  };

  return (
    <Text className={`mt-5 text-center text-xs leading-5 ${textColor}`}>
      By signing in, you agree to our{" "}
      <Text
        className="font-semibold underline"
        onPress={() => openExternalUrl(TERMS_URL)}
        accessibilityRole="link"
      >
        Terms & Conditions
      </Text>{" "}
      and{" "}
      <Text
        className="font-semibold underline"
        onPress={() => openExternalUrl(PRIVACY_URL)}
        accessibilityRole="link"
      >
        Privacy Policy
      </Text>
      .
    </Text>
  );
};
