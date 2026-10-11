import AlertCircle from "lucide-react-native/icons/circle-alert";
import { Text, View } from "react-native";
import { THEME } from "@/src/libs/constants/theme";

export default function InlineErrorNotice({
  message,
}: {
  message?: string | null;
}) {
  if (!message) return null;

  return (
    <View
      accessibilityRole="alert"
      className="flex-row gap-2 rounded-2xl bg-ui-danger/10 p-3"
    >
      <AlertCircle size={18} color={THEME.action.destructive} />
      <Text className="flex-1 text-sm leading-5 text-ui-danger">
        {message}
      </Text>
    </View>
  );
}
