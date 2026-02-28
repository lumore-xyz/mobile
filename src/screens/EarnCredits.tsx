import Icon from "@/src/libs/Icon";
import React from "react";
import { ScrollView, Text, View } from "react-native";
import SubPageBack from "../components/headers/SubPageBack";

const earnWays = [
  {
    title: "Daily activity",
    amount: "+1 / +3",
    description:
      "Claim once per UTC day. Unverified users get +1, verified users get +3.",
  },
  {
    title: "Signup bonus",
    amount: "+10",
    description: "Granted once for new users.",
  },
  {
    title: "This-or-That approvals",
    amount: "+5",
    description:
      "Awarded when your submitted question is approved. Each question is rewarded once.",
  },
  {
    title: "Referral rewards",
    amount: "+10",
    description:
      "Given to the referrer when the referred user gets verified. Referrer must also be verified.",
  },
];

const creditUses = [
  "Use credits to unlock and power premium in-app actions.",
  "Credits support matchmaking and conversation-related actions.",
  "Credits can be used in future Lumore features and game mechanics.",
];

const EarnCreditsScreen = () => {
  return (
    <View className="flex-1 bg-ui-light">
      <SubPageBack title="Earn Credits" />
      <ScrollView className="p-4" contentContainerClassName="pb-10 gap-4">
        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-sm text-ui-shade/70">How credits are earned</Text>
          <Text className="mt-1 text-2xl font-bold">Ways to earn on Lumore</Text>
          <View className="mt-4 gap-2">
            {earnWays.map((item) => (
              <View
                key={item.title}
                className="rounded-lg border border-ui-shade/10 p-3"
              >
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="font-medium">{item.title}</Text>
                  <Text className="text-sm font-semibold text-ui-highlight">
                    {item.amount}
                  </Text>
                </View>
                <Text className="mt-1 text-sm text-ui-shade/70">
                  {item.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <View className="flex-row items-center gap-2">
            <Icon name="cash-outline" type="Ionicons" size={16} />
            <Text className="text-lg font-semibold">How credits are distributed</Text>
          </View>
          <Text className="mt-2 text-sm text-ui-shade/70">
            Credit distribution is based on completed actions and approved
            contributions. Rewards are awarded only when each condition is fully
            satisfied and are protected against duplicate payouts where applicable.
          </Text>
          <View className="mt-3 gap-2">
            <Text className="text-sm text-ui-shade/80">
              - Daily reward can be claimed once per UTC day.
            </Text>
            <Text className="text-sm text-ui-shade/80">
              - Referral bonus is paid only after the referred user is verified.
            </Text>
            <Text className="text-sm text-ui-shade/80">
              - Referral code cannot be self-applied and should come from a user
              who joined before you.
            </Text>
            <Text className="text-sm text-ui-shade/80">
              - This-or-That reward is paid only on admin approval of your
              question.
            </Text>
          </View>
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-lg font-semibold">What credits are used for</Text>
          <View className="mt-3 gap-2">
            {creditUses.map((item) => (
              <Text key={item} className="text-sm text-ui-shade/80">
                - {item}
              </Text>
            ))}
            <Text className="text-sm text-ui-shade/80">
              - Starting a new matched conversation currently costs 1 credit per
              participant.
            </Text>
          </View>
        </View>

        <View className="rounded-2xl border border-ui-shade/10 bg-white p-4">
          <Text className="text-lg font-semibold">Future plan: Lumore Token</Text>
          <Text className="mt-2 text-sm text-ui-shade/80">
            We plan to launch a Lumore token in the future. The target model is 1
            credit = 1 Lumore token, designed to be tradable on the open market
            after launch.
          </Text>
          <Text className="mt-2 text-xs text-ui-shade/60">
            Note: Token launch, conversion, and market availability are future
            plans and are not live yet.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default EarnCreditsScreen;
