import Button from "@/src/components/ui/Button";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";

export default function EmptyRoomsState({
  search,
  onCreate,
}: {
  search: string;
  onCreate: () => void;
}) {
  return (
    <View className="mt-1 items-center rounded-[24px] border border-ui-parchment bg-ui-paper px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-forest/10">
        <Icon name="MapPin" size={24} color={COLORS.forest} />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-ink">
        {search ? "No communities match that search" : "No communities to show yet"}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-slate">
        {search
          ? "Try another name or tag, or start a community of your own."
          : "Start one for your campus, favorite topic, event, or neighborhood."}
      </Text>
      <Button text="Create a community" className="mt-5 px-6" onClick={onCreate} />
    </View>
  );
}
