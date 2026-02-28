import SubPageBack from "../components/headers/SubPageBack";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";

const GamesScreen = () => {
  return (
    <View className="flex-1 bg-ui-light">
      <SubPageBack title="Games" />
      <View className="p-4">
        <View className="mb-3">
          <Text className="text-2xl font-semibold text-ui-shade">Games</Text>
          <Text className="text-sm text-ui-shade/70 mt-1">
            Help us understand your vibe better.
          </Text>
        </View>

        <Pressable
          onPress={() => router.navigate("/(subpage)/games/this-or-that")}
          className="rounded-2xl border border-ui-highlight/30 bg-ui-highlight/10 p-4"
        >
          <Text className="text-base font-semibold text-ui-highlight">
            Play This Or That
          </Text>
          <Text className="text-xs text-ui-shade mt-1">
            Choose between two options and shape your match signals.
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default GamesScreen;
