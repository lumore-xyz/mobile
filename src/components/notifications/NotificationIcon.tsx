import React from "react";
import { Text, View } from "react-native";

import Icon from "../../libs/Icon";
import type { NotificationEntityType } from "../../libs/notifications/constants";

interface NotificationIconProps {
  entityType: NotificationEntityType | string | null;
  type: string | null;
  size?: number;
}

const ENTITY_ICONS: Record<string, { name: string; color: string }> = {
  match: { name: "Heart", color: "#E11D48" },
  community: { name: "MapPin", color: "#0EA5E9" },
  feedback: { name: "MessageCircleMore", color: "#7C3AED" },
  game: { name: "Gamepad2", color: "#F97316" },
  account: { name: "ShieldCheck", color: "#10B981" },
  system: { name: "Bell", color: "#541388" },
};

const TYPE_OVERRIDES: Record<string, { name: string; color: string }> = {
  FEEDBACK_RECEIVED: {
    name: "MessageCircleMore",
    color: "#7C3AED",
  },
  ACCOUNT_VERIFICATION_APPROVED: {
    name: "ShieldCheck",
    color: "#10B981",
  },
  ACCOUNT_VERIFICATION_COMPLETED: {
    name: "ShieldCheck",
    color: "#10B981",
  },
  ACCOUNT_VERIFICATION_REVOKED: {
    name: "ShieldHalf",
    color: "#F59E0B",
  },
  ACCOUNT_VERIFICATION_REJECTED: {
    name: "ShieldX",
    color: "#EF4444",
  },
  GAME_SUBMISSION_APPROVED: {
    name: "CircleCheck",
    color: "#10B981",
  },
  GAME_SUBMISSION_REJECTED: {
    name: "CircleX",
    color: "#EF4444",
  },
  COMMUNITY_INVITE_RECEIVED: {
    name: "MailOpen",
    color: "#0EA5E9",
  },
  COMMUNITY_JOINED: {
    name: "LogIn",
    color: "#0EA5E9",
  },
  COMMUNITY_ROLE_UPDATED: {
    name: "Key",
    color: "#0EA5E9",
  },
  MATCH_CREATED: {
    name: "Heart",
    color: "#E11D48",
  },
  MATCH_CREATED_FROM_COMMUNITY: {
    name: "Heart",
    color: "#DB2777",
  },
  SYSTEM_MESSAGE: {
    name: "Bell",
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
