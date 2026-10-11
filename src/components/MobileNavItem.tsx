import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import { Pressable, Text } from "react-native";

interface MobileNavItemProps {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}

const MobileNavItem = ({
  label,
  icon,
  active,
  onPress,
}: MobileNavItemProps) => {
  const color = active ? COLORS.champagne : COLORS.parchment;

  return (
    <Pressable
      onPress={onPress}
      className={`min-h-14 flex-1 items-center justify-center rounded-2xl py-1 active:opacity-70 ${active ? "bg-ui-paper/10" : ""}`}
      hitSlop={8}
      android_ripple={{ color: `${COLORS.paper}14`, borderless: false }}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Icon name={icon} size={24} color={color} />
      <Text
        className={`mt-1 text-xs ${
          active
            ? "text-[13px] font-semibold text-ui-champagne"
            : "font-medium text-ui-parchment"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
};

export default MobileNavItem;
