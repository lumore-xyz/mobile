import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { triggerSelectionHaptic } from "../utils/haptics";

const NAV_ITEMS = [
  {
    label: "Explore",
    path: "/explore",
    icon: (active: boolean, color: string) => (
      <Ionicons
        name={active ? "rocket" : "rocket-outline"}
        size={24}
        color={color}
      />
    ),
  },
  {
    label: "Chats",
    path: "/chat",
    icon: (active: boolean, color: string) => (
      <Ionicons
        name={active ? "chatbubble" : "chatbubble-outline"}
        size={24}
        color={color}
      />
    ),
  },
  {
    label: "Create",
    path: "/create-post",
    icon: (active: boolean, color: string) => (
      <MaterialCommunityIcons
        name={active ? "plus-circle-multiple" : "plus-circle-multiple-outline"}
        size={24}
        color={color}
      />
    ),
  },
  {
    label: "Profile",
    path: "/profile",
    icon: (active: boolean, color: string) => (
      <Ionicons
        name={active ? "person" : "person-outline"}
        size={24}
        color={color}
      />
    ),
  },
];

const isRouteActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <View className="w-full flex-row items-center justify-between border-t border-ui-shade/10 bg-ui-light px-4 py-2.5">
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
                router.push(item.path as any);
              }
            }}
            icon={(color) => item.icon(active, color)}
          />
        );
      })}
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
  icon: (color: string) => any;
}) {
  const color = active ? "#000000" : "#565656";

  return (
    <Pressable
      onPress={onPress}
      className="min-h-12 flex-1 items-center justify-center rounded-xl py-1"
      hitSlop={8}
      android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: false }}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      {icon(color)}
      <Text
        className={`mt-1 text-xs ${active ? "text-black" : "text-gray-500"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default React.memo(MobileNav);
