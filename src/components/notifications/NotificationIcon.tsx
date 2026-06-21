import React from "react";
import { Text, View } from "react-native";

import Icon from "../../libs/Icon";
import type { NotificationEntityType } from "../../libs/notifications/constants";

interface NotificationIconProps {
  entityType: NotificationEntityType | string | null;
  type: string | null;
  size?: number;
}

const ENTITY_ICONS: Record<string, { name: string; type: string; color: string }> = {
  match: { name: "heart", type: "Ionicons", color: "#E11D48" },
  community: { name: "location", type: "Ionicons", color: "#0EA5E9" },
  feedback: { name: "chatbubble-ellipses", type: "Ionicons", color: "#7C3AED" },
  game: { name: "game-controller", type: "Ionicons", color: "#F97316" },
  account: { name: "shield-checkmark", type: "Ionicons", color: "#10B981" },
  system: { name: "notifications", type: "Ionicons", color: "#541388" },
};

const TYPE_OVERRIDES: Record<string, { name: string; type: string; color: string }> = {
  FEEDBACK_RECEIVED: {
    name: "chatbubble-ellipses",
    type: "Ionicons",
    color: "#7C3AED",
  },
  ACCOUNT_VERIFICATION_APPROVED: {
    name: "shield-checkmark",
    type: "Ionicons",
    color: "#10B981",
  },
  ACCOUNT_VERIFICATION_COMPLETED: {
    name: "shield-checkmark",
    type: "Ionicons",
    color: "#10B981",
  },
  ACCOUNT_VERIFICATION_REVOKED: {
    name: "shield-half",
    type: "Ionicons",
    color: "#F59E0B",
  },
  ACCOUNT_VERIFICATION_REJECTED: {
    name: "shield-outline",
    type: "Ionicons",
    color: "#EF4444",
  },
  GAME_SUBMISSION_APPROVED: {
    name: "checkmark-circle",
    type: "Ionicons",
    color: "#10B981",
  },
  GAME_SUBMISSION_REJECTED: {
    name: "close-circle",
    type: "Ionicons",
    color: "#EF4444",
  },
  COMMUNITY_INVITE_RECEIVED: {
    name: "mail-unread",
    type: "Ionicons",
    color: "#0EA5E9",
  },
  COMMUNITY_JOINED: {
    name: "enter",
    type: "Ionicons",
    color: "#0EA5E9",
  },
  COMMUNITY_ROLE_UPDATED: {
    name: "key",
    type: "Ionicons",
    color: "#0EA5E9",
  },
  MATCH_CREATED: {
    name: "heart",
    type: "Ionicons",
    color: "#E11D48",
  },
  MATCH_CREATED_FROM_COMMUNITY: {
    name: "heart",
    type: "Ionicons",
    color: "#DB2777",
  },
  SYSTEM_MESSAGE: {
    name: "notifications",
    type: "Ionicons",
    color: "#541388",
  },
};

const NotificationIcon: React.FC<NotificationIconProps> = ({
  entityType,
  type,
  size = 22,
}) => {
  const config =
    (type && TYPE_OVERRIDES[type]) ||
    (entityType && ENTITY_ICONS[entityType]) ||
    ENTITY_ICONS.system;

  return (
    <View
      className="h-10 w-10 items-center justify-center rounded-full"
      style={{ backgroundColor: `${config.color}1A` }}
    >
      <Icon
        name={config.name}
        type={config.type}
        size={size}
        color={config.color}
      />
    </View>
  );
};

export const NotificationTypeBadge: React.FC<{ type?: string | null }> = ({
  type,
}) => {
  if (!type) return null;
  return (
    <Text className="text-[10px] uppercase tracking-wide text-ui-shade/60">
      {type.replace(/_/g, " ")}
    </Text>
  );
};

export default NotificationIcon;
