import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";
import { CreditHistoryItem } from "@/src/utils/types";

const TYPE_LABELS: Record<string, string> = {
  explore_unlock: "Daily Explore",
  signup_bonus: "Signup bonus",
  daily_active: "Daily active reward",
  conversation_start: "Conversation start",
  this_or_that_approved: "This-or-That approved",
  referral_bonus: "Referral bonus",
  rewarded_ad_watch: "Rewarded ad watch",
  admin_adjustment: "Admin adjustment",
};

const CreditHistoryCard = ({ item }: { item: CreditHistoryItem }) => {
  const isCredit = item.amount >= 0;

  return (
    <View className="mt-3 flex-row items-center justify-between gap-3 rounded-[22px] bg-ui-paper p-4">
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className={`h-11 w-11 items-center justify-center rounded-full ${
            isCredit ? "bg-ui-forest/10" : "bg-ui-danger/10"
          }`}
        >
          <Icon
            name={isCredit ? "ArrowDownToLine" : "ArrowUpFromLine"}
            size={18}
            color={isCredit ? COLORS.forest : COLORS.danger}
          />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-ui-ink">
            {TYPE_LABELS[item.type] || item.type}
          </Text>
          <Text className="mt-1 text-xs leading-4 text-ui-slate">
            {new Date(item.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text
          className={`text-base font-bold ${
            isCredit ? "text-ui-forest" : "text-ui-danger"
          }`}
        >
          {isCredit ? `+${item.amount}` : item.amount}
        </Text>
        <Text className="mt-1 text-xs text-ui-slate">
          Balance {item.balanceAfter}
        </Text>
      </View>
    </View>
  );
};

export default CreditHistoryCard;
