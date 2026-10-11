import Button from "@/src/components/ui/Button";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Text, View } from "react-native";

interface CommunityMembershipPanelProps {
  isInPool: boolean;
  isMember: boolean;
  isTopicCommunity: boolean;
  poolStatus?: string;
  isLeavingPool: boolean;
  isRejoining: boolean;
  isJoining: boolean;
  onLeave: () => void;
  onRejoin: () => void;
  onJoin: () => void;
}

const CommunityMembershipPanel = ({
  isInPool,
  isMember,
  isTopicCommunity,
  poolStatus,
  isLeavingPool,
  isRejoining,
  isJoining,
  onLeave,
  onRejoin,
  onJoin,
}: CommunityMembershipPanelProps) => {
  const message = isInPool
    ? "You are in this matching pool."
    : isMember
      ? "You are a member of this community."
      : isTopicCommunity
        ? "Join this community to meet people who share your interests. Joining also adds you to its matching pool."
        : "Join this local community’s matching pool to meet people nearby.";

  return (
    <>
      <View className="mt-3 rounded-[24px] bg-ui-midnight p-3">
        <View className="flex-row items-center justify-start gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-champagne">
            <Icon
              name={
                isInPool
                  ? "Sparkles"
                  : isMember
                    ? "UsersRound"
                    : "HeartHandshake"
              }
              size={18}
              color={COLORS.ink}
            />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-ui-paper">{message}</Text>
            {poolStatus === "matched" ? (
              <Text className="mt-1 text-sm leading-5 text-ui-paper/70">
                You matched in this community. Rejoin when you want another
                cycle.
              </Text>
            ) : null}
            {poolStatus === "insufficient_credits" ? (
              <Text className="mt-1 text-sm leading-5 text-ui-paper/80">
                Add credits, then rejoin this community.
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      <View className="mt-4 gap-3">
        {isInPool ? (
          <Button
            text={isLeavingPool ? "Exiting..." : "Exit matching pool"}
            variant="outline"
            className="rounded-full"
            disabled={isLeavingPool}
            onClick={onLeave}
          />
        ) : (
          <Button
            text={
              isMember
                ? isRejoining
                  ? "Rejoining..."
                  : "Rejoin pool"
                : isJoining
                  ? "Joining..."
                  : "Join community"
            }
            className="rounded-full"
            disabled={isJoining || isRejoining}
            onClick={isMember ? onRejoin : onJoin}
          />
        )}
      </View>
    </>
  );
};

export default CommunityMembershipPanel;
