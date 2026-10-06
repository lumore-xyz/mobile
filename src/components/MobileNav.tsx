import { router, usePathname } from "expo-router";
import React, { type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import Icon from "../libs/Icon";
import { COLORS } from "../libs/constants/theme";
import { triggerSelectionHaptic } from "../utils/haptics";

const NAV_ITEMS = [
  {
    label: "Explore",
    path: "/explore",
    icon: (color: string) => <Icon name="Rocket" size={24} color={color} />,
  },
  {
    label: "Community",
    path: "/community",
    icon: (color: string) => <Icon name="MapPin" size={24} color={color} />,
  },
  {
    label: "Chats",
    path: "/chat",
    icon: (color: string) => (
      <Icon name="MessageCircle" size={24} color={color} />
    ),
  },
  {
    label: "Create",
    path: "/create-post",
    icon: (color: string) => <Icon name="CirclePlus" size={24} color={color} />,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: (color: string) => <Icon name="UserRound" size={24} color={color} />,
  },
] as const;

const isRouteActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <View className="w-full px-4 pb-2 pt-2">
      <View className="flex-row items-center justify-between rounded-[22px] border border-ui-paper/10 bg-ui-midnight px-1.5 py-1.5 shadow-md">
        {NAV_ITEMS.map((item) => {
          const active = isRouteActive(pathname, item.path);
          return (
            <NavItem
              key={item.path}
              label={item.label}
              active={active}
              onPress={() => {
                if (!active) {
                  triggerSelectionHaptic();
                  router.push(item.path);
                }
              }}
              icon={item.icon}
            />
          );
        })}
      </View>
    </View>
  );
};

function NavItem({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  icon: (color: string) => ReactNode;
}) {
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
      {icon(color)}
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
}

export default React.memo(MobileNav);
