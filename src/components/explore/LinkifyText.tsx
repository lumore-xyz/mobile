import React, { useMemo } from "react";
import { Linking, Text } from "react-native";

const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
const URL_TEST_REGEX = /^(https?:\/\/[^\s]+|www\.[^\s]+)$/i;

interface LinkifyTextProps {
  text: string;
  isOwnMessage: boolean;
}

const LinkifyText = React.memo(function LinkifyText({
  text,
  isOwnMessage,
}: LinkifyTextProps) {
  const parts = useMemo(() => text.split(URL_SPLIT_REGEX), [text]);

  return (
    <Text className={`text-base leading-6 ${isOwnMessage ? "text-ui-paper" : "text-ui-ink"}`}>
      {parts.map((part, index) => {
        if (!part) return null;
        if (URL_TEST_REGEX.test(part)) {
          const href = part.startsWith("http") ? part : `https://${part}`;
          return (
            <Text
              key={`${part}-${index}`}
              className={`${isOwnMessage ? "text-ui-paper" : "text-ui-forest"} underline`}
              onPress={() => {
                void Linking.openURL(href).catch(() => {});
              }}
            >
              {part}
            </Text>
          );
        }
        return <Text key={`${part}-${index}`}>{part}</Text>;
      })}
    </Text>
  );
});

export default LinkifyText;
