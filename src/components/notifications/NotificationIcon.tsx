import React from "react";
import { View } from "react-native";

import Icon from "../../libs/Icon";
import { COLORS } from "../../libs/constants/theme";

interface NotificationIconProps {
  entityType: string | null;
  type: string | null;
  size?: number;
}

const ENTITY_ICONS: Record<string, { name: string; color: string }> = {
  match: { name: "Heart", color: COLORS.aubergine },
  community: { name: "MapPin", color: COLORS.midnight },
  feedback: { name: "MessageCircleMore", color: COLORS.forest },
  game: { name: "Gamepad2", color: COLORS.aubergine },
  account: { name: "ShieldCheck", color: COLORS.forest },
  system: { name: "Bell", color: COLORS.forest },
};

const TYPE_OVERRIDES: Record<string, { name: string; color: string }> = {
  FEEDBACK_RECEIVED: {
    name: "MessageCircleMore",
    color: COLORS.forest,
  },
  ACCOUNT_VERIFICATION_APPROVED: {
    name: "ShieldCheck",
    color: COLORS.forest,
  },
  ACCOUNT_VERIFICATION_COMPLETED: {
    name: "ShieldCheck",
    color: COLORS.forest,
  },
  ACCOUNT_VERIFICATION_REVOKED: {
    name: "ShieldHalf",
    color: COLORS.champagne,
  },
  ACCOUNT_VERIFICATION_REJECTED: {
    name: "ShieldX",
    color: COLORS.danger,
  },
  GAME_SUBMISSION_APPROVED: {
    name: "CircleCheck",
    color: COLORS.forest,
  },
  GAME_SUBMISSION_REJECTED: {
    name: "CircleX",
    color: COLORS.danger,
  },
  COMMUNITY_INVITE_RECEIVED: {
    name: "MailOpen",
    color: COLORS.midnight,
  },
  COMMUNITY_JOINED: {
    name: "LogIn",
    color: COLORS.midnight,
  },
  COMMUNITY_ROLE_UPDATED: {
    name: "Key",
    color: COLORS.midnight,
  },
  MATCH_CREATED: {
    name: "Heart",
    color: COLORS.aubergine,
  },
  MATCH_CREATED_FROM_COMMUNITY: {
    name: "Heart",
    color: COLORS.aubergine,
  },
  SYSTEM_MESSAGE: {
    name: "Bell",
    color: COLORS.forest,
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

export default NotificationIcon;
