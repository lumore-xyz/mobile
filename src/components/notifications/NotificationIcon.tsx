import React from "react";
import { Text, View } from "react-native";

import Icon from "../../libs/Icon";
import { COLORS } from "../../libs/constants/theme";
import type { NotificationEntityType } from "../../libs/notifications/constants";

interface NotificationIconProps {
  entityType: NotificationEntityType | string | null;
  type: string | null;
  size?: number;
}

const ENTITY_ICONS: Record<string, { name: string; color: string }> = {
  match: { name: "Heart", color: COLORS.accent },
  community: { name: "MapPin", color: COLORS.foreground },
  feedback: { name: "MessageCircleMore", color: COLORS.highlight },
  game: { name: "Gamepad2", color: COLORS.accent },
  account: { name: "ShieldCheck", color: COLORS.highlight },
  system: { name: "Bell", color: COLORS.highlight },
};

const TYPE_OVERRIDES: Record<string, { name: string; color: string }> = {
  FEEDBACK_RECEIVED: {
    name: "MessageCircleMore",
    color: COLORS.highlight,
  },
  ACCOUNT_VERIFICATION_APPROVED: {
    name: "ShieldCheck",
    color: COLORS.highlight,
  },
  ACCOUNT_VERIFICATION_COMPLETED: {
    name: "ShieldCheck",
    color: COLORS.highlight,
  },
  ACCOUNT_VERIFICATION_REVOKED: {
    name: "ShieldHalf",
    color: COLORS.primary,
  },
  ACCOUNT_VERIFICATION_REJECTED: {
    name: "ShieldX",
    color: COLORS.danger,
  },
  GAME_SUBMISSION_APPROVED: {
    name: "CircleCheck",
    color: COLORS.highlight,
  },
  GAME_SUBMISSION_REJECTED: {
    name: "CircleX",
    color: COLORS.danger,
  },
  COMMUNITY_INVITE_RECEIVED: {
    name: "MailOpen",
    color: COLORS.foreground,
  },
  COMMUNITY_JOINED: {
    name: "LogIn",
    color: COLORS.foreground,
  },
  COMMUNITY_ROLE_UPDATED: {
    name: "Key",
    color: COLORS.foreground,
  },
  MATCH_CREATED: {
    name: "Heart",
    color: COLORS.accent,
  },
  MATCH_CREATED_FROM_COMMUNITY: {
    name: "Heart",
    color: COLORS.accent,
  },
  SYSTEM_MESSAGE: {
    name: "Bell",
    color: COLORS.highlight,
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
