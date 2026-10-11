import { Text, View } from "react-native";

export default function AuthMethodDivider() {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-px flex-1 bg-ui-ink/10" />
      <Text className="text-xs text-ui-ink/60">or</Text>
      <View className="h-px flex-1 bg-ui-ink/10" />
    </View>
  );
}
