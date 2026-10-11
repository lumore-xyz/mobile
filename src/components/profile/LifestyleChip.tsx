import Icon from "@/src/libs/Icon";
import { Text, View } from "react-native";

const LifestyleChip = ({ icon, label }: { icon: string; label: string }) => (
  <View className="flex-row items-center gap-1.5 rounded-full bg-ui-forest/10 px-3 py-1.5">
    <Icon name={icon} size={14} />
    <Text className="text-sm font-medium text-ui-ink">{label}</Text>
  </View>
);

export default LifestyleChip;
