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
  const textColor = tone === "light" ? "text-ui-light" : "text-ui-shade";

  const openExternalUrl = (url: string) => {
    void Linking.openURL(url).catch(() => {});
  };

  return (
    <Text className={`text-center mt-4 ${textColor}`}>
      By signing in, you agree to our{" "}
      <Text className="underline" onPress={() => openExternalUrl(TERMS_URL)}>
        Terms & Conditions
      </Text>{" "}
      and{" "}
      <Text className="underline" onPress={() => openExternalUrl(PRIVACY_URL)}>
        Privacy Policy
      </Text>
      .
    </Text>
  );
};
