import { router, usePathname } from "expo-router";
import React from "react";
import { View } from "react-native";
import MobileNavItem from "@/src/components/MobileNavItem";
import { triggerSelectionHaptic } from "../utils/haptics";

const NAV_ITEMS = [
  {
    label: "Explore",
    path: "/explore",
    icon: "Rocket",
  },
  {
    label: "Community",
    path: "/community",
    icon: "MapPin",
  },
  {
    label: "Chats",
    path: "/chat",
    icon: "MessageCircle",
  },
  {
    label: "Create",
    path: "/create-post",
    icon: "CirclePlus",
  },
  {
    label: "Profile",
    path: "/profile",
    icon: "UserRound",
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
            <MobileNavItem
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

export default React.memo(MobileNav);
