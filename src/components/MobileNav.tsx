import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  return (
    <View className="w-full flex-row items-center justify-between bg-ui-light px-4 py-3">
      {/* Explore */}
      <NavItem
        label="Explore"
        active={isActive("/explore")}
        onPress={() => (isActive("/explore") ? null : router.push("/explore"))}
        icon={(color) => (
          <Ionicons
            name={isActive("/explore") ? "rocket" : "rocket-outline"}
            size={24}
            color={color}
          />
        )}
      />

      {/* Chats */}
      <NavItem
        label="Chats"
        active={isActive("/chat")}
        onPress={() => (isActive("/chat") ? null : router.push("/chat"))}
        icon={(color) => (
          <Ionicons
            name={isActive("/chat") ? "chatbubble" : "chatbubble-outline"}
            size={24}
            color={color}
          />
        )}
      />

      {/* Create */}
      <NavItem
        label="Create"
        active={isActive("/create-post")}
        onPress={() =>
          isActive("/create-post") ? null : router.push("/create-post")
        }
        icon={(color) => (
          <MaterialCommunityIcons
            name={
              isActive("/create-post")
                ? "plus-circle-multiple"
                : "plus-circle-multiple-outline"
            }
            size={24}
            color={color}
          />
        )}
      />

      {/* Profile */}
      <NavItem
        label="Profile"
        active={isActive("/profile")}
        onPress={() => (isActive("/profile") ? null : router.push("/profile"))}
        icon={(color) => (
          <Ionicons
            name={isActive("/profile") ? "person" : "person-outline"}
            size={24}
            color={color}
          />
        )}
      />
    </View>
  );
}

/* ---------- Nav Item ---------- */

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
  const color = active ? "#000000" : "#565656"; // gray-500

  return (
    <Pressable onPress={onPress} className="flex-1 items-center justify-center">
      {icon(color)}
      <Text
        className={`mt-1 text-xs ${active ? "text-black" : "text-gray-500"}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
