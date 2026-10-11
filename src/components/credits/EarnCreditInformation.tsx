import SurfacePanel from "@/src/components/ui/SurfacePanel";
import EarnCreditMethodCard from "@/src/components/credits/EarnCreditMethodCard";
import EarnCreditRuleRow from "@/src/components/credits/EarnCreditRuleRow";
import EarnCreditSectionHeader from "@/src/components/credits/EarnCreditSectionHeader";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Text, View } from "react-native";

const earnWays = [
  {
    title: "Rewarded ad watch",
    icon: "Video",
    amount: "+1 (max 3/hour)",
    description:
      "Watch a rewarded ad and earn +1 credit. Up to 3 successful ad rewards are granted per rolling hour.",
  },
  {
    title: "Daily activity",
    icon: "CalendarCheck",
    amount: "+1 / +3",
    description:
      "Claim once per UTC day. Unverified users get +1, verified users get +3.",
  },
  {
    title: "Signup bonus",
    icon: "PartyPopper",
    amount: "+10",
    description: "Granted once for new users.",
  },
  {
    title: "This-or-That approvals",
    icon: "BadgeCheck",
    amount: "+5",
    description:
      "Awarded when your submitted question is approved. Each question is rewarded once.",
  },
  {
    title: "Referral rewards",
    icon: "Gift",
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

export default function EarnCreditInformation() {
  return (
    <>
      <View className="mt-5 rounded-[24px] border border-ui-parchment bg-ui-surface-page p-4">
        <EarnCreditSectionHeader
          icon="BadgePlus"
          title="Ways to earn on Lumore"
          description="A quick map of every reward path."
        />
        <View className="mt-3 gap-3">
          {earnWays.map((item) => (
            <EarnCreditMethodCard key={item.title} {...item} />
          ))}
        </View>
      </View>

      <SurfacePanel surface="paper" className="mt-5">
        <EarnCreditSectionHeader
          icon="ShieldCheck"
          title="How credits are distributed"
          description="Rewards are checked before credits are granted."
        />
        <Text className="mt-3 text-sm leading-5 text-ui-slate">
          Credit distribution is based on completed actions and approved
          contributions. Rewards are awarded only when each condition is fully
          satisfied and are protected against duplicate payouts where
          applicable.
        </Text>
        <View className="mt-4 gap-2">
          {[
            "Rewarded ad grants +1 credit, up to 3 successful claims per rolling hour.",
            "Daily reward can be claimed once per UTC day.",
            "Referral bonus is paid only after the referred user is verified.",
            "Referral code cannot be self-applied and should come from a user who joined before you.",
            "This-or-That reward is paid only on admin approval of your question.",
          ].map((item) => (
            <EarnCreditRuleRow key={item} text={item} />
          ))}
        </View>
      </SurfacePanel>

      <View className="mt-5 rounded-[24px] border border-ui-parchment bg-ui-surface-page p-4">
        <EarnCreditSectionHeader
          icon="WalletCards"
          title="What credits are used for"
          description="Credits power premium actions across Lumore."
        />
        <View className="mt-3 gap-2">
          {creditUses.map((item) => (
            <EarnCreditRuleRow key={item} text={item} />
          ))}
          <EarnCreditRuleRow text="Starting a new matched conversation currently costs 1 credit per participant." />
        </View>
      </View>

      <View className="mt-5 rounded-[24px] border border-ui-champagne/30 bg-ui-champagne/20 p-5">
        <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-ui-paper">
          <Icon name="Coins" size={20} color={COLORS.forest} />
        </View>
        <Text className="text-xl font-bold text-ui-ink">
          Future plan: Lumore Token
        </Text>
        <Text className="mt-2 text-sm leading-5 text-ui-ink/80">
          We plan to launch a Lumore token in the future. The target model is 1
          credit = 1 Lumore token, designed to be tradable on the open market
          after launch.
        </Text>
        <Text className="mt-3 text-xs leading-4 text-ui-slate">
          Note: Token launch, conversion, and market availability are future
          plans and are not live yet.
        </Text>
      </View>
    </>
  );
}
