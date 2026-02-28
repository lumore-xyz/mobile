import { ChatProvider } from "@/src/service/context/ChatContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <ChatProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ChatProvider>
  );
}
