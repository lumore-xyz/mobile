import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";

interface ChatMetadataProps {
  icon: string;
  text: string | number;
}

const ChatMetadata = React.memo(function ChatMetadata({ icon, text }: ChatMetadataProps) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon name={icon} size={16} className="!h-4 !w-4 text-ui-ink" />
      <Text className="text-xs font-medium text-ui-slate">{text}</Text>
    </View>
  );
});

export default ChatMetadata;
