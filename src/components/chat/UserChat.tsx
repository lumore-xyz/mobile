import InboxItemSkeleton from "@/src/components/chat/InboxItemSkeleton";
import ChatMetadata from "@/src/components/chat/ChatMetadata";
import decodeLastMessage from "@/src/domain/chat/decodeLastMessage";
import formatInboxDate from "@/src/domain/chat/formatInboxDate";
import getLastMessageIcon from "@/src/domain/chat/getLastMessageIcon";
import type { MatchRoomParticipantSummary, MatchRoomSummary } from "@/src/domain/chat/inboxTypes";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { useUser } from "@/src/hooks/useUser";
import getAgeFromDate from "@/src/utils/helpers/getAgeFromDate";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

interface UserChatProps {
  room: MatchRoomSummary;
  matchedUser?: MatchRoomParticipantSummary;
}

const UserChat = React.memo(function UserChat({
  room,
  matchedUser,
}: UserChatProps) {
  const { user, isLoading, error } = useUser(matchedUser?._id ?? "");
  const [failedProfilePicture, setFailedProfilePicture] = useState(false);
  useEffect(() => setFailedProfilePicture(false), [user?.profilePicture]);
  const unreadCount = Number(room?.unreadCount || 0);
  const lastMessagePreview = useMemo(() => decodeLastMessage(room), [room]);
  const finalPreview = lastMessagePreview;
  const previewIcon = getLastMessageIcon(room);
  const isRoomMatch = room?.source === "location_room";
  const roomMatchTitle =
    room?.sourceMetadata?.title ||
    (typeof room.locationRoom === "object"
      ? room.locationRoom?.title
      : undefined) ||
    "Community";
  const isUserUnavailable = Boolean(error);
  const displayName = isUserUnavailable
    ? "Lumore User"
    : user?.isViewerUnlockedByUser
      ? user.realName || user.nickname || user.username || "Lumore User"
      : user?.nickname || "Lumore User";

  if (isLoading) {
    return <InboxItemSkeleton />;
  }

  const content = (
    <Pressable
      className={`flex-row items-center rounded-[24px] border px-3 py-3 active:opacity-75 ${
        unreadCount > 0
          ? "border-ui-forest/20 bg-ui-forest/5"
          : "border-ui-parchment bg-ui-paper"
      }`}
      disabled={isUserUnavailable}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}. ${unreadCount > 0 ? `${unreadCount} unread. ` : ""}${finalPreview || "No messages yet"}`}
      accessibilityHint={
        isUserUnavailable
          ? "This conversation is unavailable"
          : "Opens this conversation"
      }
      accessibilityState={{ disabled: isUserUnavailable }}
    >
      <View className="relative mr-3">
        <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-[20px] bg-ui-porcelain">
          {user?.profilePicture && !failedProfilePicture ? (
            <Image
              source={{ uri: user.profilePicture }}
              contentFit="cover"
              transition={150}
              recyclingKey={user.profilePicture}
              blurRadius={user?.isViewerUnlockedByUser ? 0 : 12}
              className="h-full w-full"
              style={{ width: "100%", height: "100%" }}
              onError={() => setFailedProfilePicture(true)}
              accessible
              accessibilityLabel={`Profile photo of ${displayName}`}
            />
          ) : (
            <Text className="text-2xl font-bold text-ui-midnight">
              {displayName.charAt(0)}
            </Text>
          )}
        </View>

        <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border border-ui-parchment bg-ui-paper">
          {user?.isViewerUnlockedByUser && !isUserUnavailable ? (
            <Icon name="LockOpen" size={12} className="text-ui-ink" />
          ) : (
            <Icon name="Lock" size={12} className="text-ui-ink" />
          )}
        </View>
      </View>

      <View className="min-w-0 flex-1">
        <View className="mb-1 flex-row items-center gap-2">
          <Text
            className={`min-w-0 flex-1 text-base ${unreadCount > 0 ? "font-bold" : "font-semibold"}`}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          {isRoomMatch ? (
            <View className="self-start rounded-full bg-ui-forest/10 px-2 py-0.5">
              <Text className="text-xs font-semibold text-ui-forest">
                {roomMatchTitle}
              </Text>
            </View>
          ) : null}
        </View>

        {finalPreview ? (
          <View className="flex-row items-center gap-1.5">
            <Icon name={previewIcon} size={14} color={COLORS.slate} />
            <Text
              className={`min-w-0 flex-1 text-sm ${unreadCount > 0 ? "font-semibold text-ui-ink" : "text-ui-slate"}`}
              numberOfLines={1}
            >
              {finalPreview}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-3">
            {user?.dob && <ChatMetadata icon="Cake" text={getAgeFromDate(user.dob)} />}
            {user?.gender && <ChatMetadata icon="UserRound" text={user.gender} />}
            {user?.distance != null && (
              <ChatMetadata icon="Footprints" text={`${user.distance.toFixed(1)}km`} />
            )}
          </View>
        )}
      </View>

      <View className="ml-3 items-end gap-2">
        <Text className={`text-xs font-medium ${unreadCount > 0 ? "text-ui-forest" : "text-ui-slate"}`}>
          {formatInboxDate(room.lastMessageAt)}
        </Text>
        {unreadCount > 0 ? (
          <View className="h-6 min-w-6 items-center justify-center rounded-2xl bg-ui-forest px-1.5">
            <Text className="text-xs font-bold text-ui-paper">{unreadCount > 99 ? "99+" : unreadCount}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );

  return isUserUnavailable ? (
    <View className="mb-3 opacity-70">{content}</View>
  ) : (
    <Link className="mb-3" href={`/chat/${room._id}`} asChild>
      {content}
    </Link>
  );
});

export default UserChat;
