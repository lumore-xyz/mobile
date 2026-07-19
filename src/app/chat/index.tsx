import MobileNav from "@/src/components/MobileNav";
import NotificationBell from "@/src/components/notifications/NotificationBell";
import Skeleton from "@/src/components/ui/Skeleton";
import Tabs, { TabItem } from "@/src/components/ui/Tabs";
import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import { useNotificationSocketSync } from "@/src/hooks/useNotifications";
import { useUser } from "@/src/hooks/useUser";
import { fetchIbox } from "@/src/libs/apis";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import { calculateAge, triggerSelectionHaptic } from "@/src/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  ListRenderItem,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

type InboxTab = "active" | "archive";

interface InboxProps {
  user: any;
  rooms: any[];
  isLoading: boolean;
  error?: unknown;
  mode: InboxTab;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

interface UserChatProps {
  room: any;
  matchedUser: any;
}

interface MetaProps {
  icon: string;
  text: string | number;
}

const ChatInbox = () => {
  const [activeTab, setActiveTab] = useState<InboxTab>("active");
  const currentUser = getUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket, revalidateSocket } = useSocket();
  const { user, isLoading: gettingUser } = useUser(currentUser?._id);

  const {
    data: activeRooms = [],
    isLoading: isLoadingActive,
    error: activeError,
    isRefetching: isRefetchingActive,
    refetch: refetchActive,
  } = useQuery<any[]>({
    queryKey: ["inbox", "active"],
    queryFn: () => fetchIbox("active"),
    enabled: !!currentUser,
  });

  const {
    data: archiveRooms = [],
    isLoading: isLoadingArchive,
    error: archiveError,
    isRefetching: isRefetchingArchive,
    refetch: refetchArchive,
  } = useQuery<any[]>({
    queryKey: ["inbox", "archive"],
    queryFn: () => fetchIbox("archive"),
    enabled: !!currentUser,
  });

  const rooms = activeTab === "active" ? activeRooms : archiveRooms;
  const isLoading = activeTab === "active" ? isLoadingActive : isLoadingArchive;
  const error = activeTab === "active" ? activeError : archiveError;
  const isRefreshing =
    activeTab === "active" ? isRefetchingActive : isRefetchingArchive;
  const refreshInbox =
    activeTab === "active" ? refetchActive : refetchArchive;
  const activeUnreadCount = useMemo(
    () =>
      activeRooms.reduce(
        (total, room) => total + Number(room?.unreadCount || 0),
        0,
      ),
    [activeRooms],
  );

  useEffect(() => {
    revalidateSocket();
  }, [revalidateSocket]);

  useEffect(() => {
    if (!socket) return;

    const onInboxUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["inbox", "active"] });
      queryClient.invalidateQueries({ queryKey: ["inbox", "archive"] });
    };

    socket.on(CHAT_SOCKET_EVENTS.inboxUpdated, onInboxUpdated);
    return () => {
      socket.off(CHAT_SOCKET_EVENTS.inboxUpdated, onInboxUpdated);
    };
  }, [socket, queryClient]);

  useNotificationSocketSync();

  return (
    <>
      <View className="flex-1 bg-ui-surface-page px-4 pt-5">
        <View className="mb-5 rounded-[28px] bg-ui-foreground p-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text className="text-3xl font-bold tracking-tight text-ui-light" accessibilityRole="header">
                Conversations
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-light/70">
                Keep the spark going, one message at a time.
              </Text>
            </View>
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => {
                triggerSelectionHaptic();
                router.push("/feedback");
              }}
              className="h-11 w-11 items-center justify-center rounded-full bg-ui-light/10 active:opacity-70"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Share chat feedback"
            >
              <Icon name="MessageCircleMore" size={20} color={COLORS.light} />
            </Pressable>
            <NotificationBell
              iconColor={COLORS.light}
              className="bg-ui-light/10"
            />
          </View>
          </View>
          {activeUnreadCount > 0 ? (
            <View className="mt-4 self-start rounded-full bg-ui-primary px-3 py-1.5">
              <Text className="text-xs font-bold text-ui-shade">
                {activeUnreadCount} unread {activeUnreadCount === 1 ? "message" : "messages"}
              </Text>
            </View>
          ) : null}
        </View>

        <InboxTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          activeCount={activeRooms.length}
          archiveCount={archiveRooms.length}
        />

        <Inbox
          user={user}
          rooms={rooms}
          isLoading={isLoading || gettingUser}
          error={error}
          mode={activeTab}
          isRefreshing={isRefreshing}
          onRefresh={() => void refreshInbox()}
        />
      </View>
      <MobileNav />
    </>
  );
};

export default ChatInbox;

export const InboxTabs = React.memo(function InboxTabs({
  activeTab,
  onTabChange,
  activeCount,
  archiveCount,
}: {
  activeTab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
  activeCount?: number;
  archiveCount?: number;
}) {
  const tabs: TabItem[] = useMemo(
    () => [
      { key: "active", label: "Active", count: activeCount },
      { key: "archive", label: "Archived", count: archiveCount },
    ],
    [activeCount, archiveCount],
  );

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onSelect={(key) => onTabChange(key as InboxTab)}
      showBadges
      hapticFeedback={true}
    />
  );
});

export const Inbox = React.memo(function Inbox({
  user,
  rooms,
  isLoading,
  error,
  mode,
  isRefreshing = false,
  onRefresh,
}: InboxProps) {
  const renderItem = useCallback<ListRenderItem<any>>(
    ({ item: room }) => {
      const matchedUser = room?.participants?.find(
        (participant: any) => participant?._id !== user?._id,
      );
      return <UserChat room={room} matchedUser={matchedUser} />;
    },
    [user?._id],
  );

  if (isLoading) {
    return <InboxSkeleton />;
  }

  if (error) {
    return <InboxState mode={mode} type="error" onAction={onRefresh} />;
  }

  if (!rooms?.length) {
    return <InboxState mode={mode} type="empty" onAction={onRefresh} />;
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(room) => String(room._id)}
      contentContainerStyle={{ paddingBottom: 24 }}
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews={Platform.OS === "android"}
      renderItem={renderItem}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.highlight}
            colors={[COLORS.highlight]}
          />
        ) : undefined
      }
    />
  );
});

const decodeLastMessage = (room: any) => {
  const lastMessage = room?.lastMessage;
  if (!lastMessage) return "";

  if (
    lastMessage.previewType === "image" ||
    lastMessage.messageType === "image"
  ) {
    return "Photo";
  }

  if (
    lastMessage.previewType === "audio" ||
    lastMessage.messageType === "audio"
  ) {
    return "Voice note";
  }

  if (!lastMessage.message) return "New message";
  return lastMessage.message;
};

const getLastMessageIcon = (room: any) => {
  const type =
    room?.lastMessage?.previewType || room?.lastMessage?.messageType || "text";
  if (type === "image") return "Image";
  if (type === "audio") return "Mic";
  return "MessageCircle";
};

const formatInboxDate = (value: unknown) => {
  if (!value) return "";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const UserChat = React.memo(function UserChat({
  room,
  matchedUser,
}: UserChatProps) {
  const { user, isLoading, error } = useUser(matchedUser?._id ?? "");
  const unreadCount = Number(room?.unreadCount || 0);
  const lastMessagePreview = useMemo(() => decodeLastMessage(room), [room]);
  const finalPreview = lastMessagePreview;
  const previewIcon = getLastMessageIcon(room);
  const isRoomMatch = room?.source === "location_room";
  const roomMatchTitle =
    room?.sourceMetadata?.title || room?.locationRoom?.title || "Community";
  const isUserUnavailable = Boolean(error);
  const displayName = isUserUnavailable
    ? "Lumore User"
    : user?.realName || user?.nickname || user?.username || "Lumore User";

  if (isLoading) {
    return <InboxItemSkeleton />;
  }

  const content = (
    <Pressable
      className={`flex-row items-center rounded-[24px] border px-3 py-3 active:opacity-75 ${
        unreadCount > 0
          ? "border-ui-highlight/20 bg-ui-highlight/5"
          : "border-ui-border bg-ui-light"
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
        <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-[20px] bg-ui-background">
          {user?.profilePicture ? (
            <Image
              source={{
                uri: user?.profilePicture,
              }}
              blurRadius={user?.isViewerUnlockedByUser ? 0 : 12}
              style={{
                resizeMode: "cover",
                width: "100%",
                height: "100%",
              }}
              accessible
              accessibilityLabel={`Profile photo of ${displayName}`}
            />
          ) : (
            <Text className="text-2xl font-bold text-ui-foreground">
              {displayName.charAt(0)}
            </Text>
          )}
        </View>

        <View className="absolute -bottom-1 -right-1 h-6 w-6 items-center justify-center rounded-full border border-ui-border bg-ui-light">
          {user?.isViewerUnlockedByUser && !isUserUnavailable ? (
            <Icon name="LockOpen" size={12} className="text-ui-shade" />
          ) : (
            <Icon name="Lock" size={12} className="text-ui-shade" />
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
            <View className="self-start rounded-full bg-ui-highlight/10 px-2 py-0.5">
              <Text className="text-xs font-semibold text-ui-highlight">
                {roomMatchTitle}
              </Text>
            </View>
          ) : null}
        </View>

        {finalPreview ? (
          <View className="flex-row items-center gap-1.5">
            <Icon name={previewIcon} size={14} color={COLORS.muted} />
            <Text
              className={`min-w-0 flex-1 text-sm ${unreadCount > 0 ? "font-semibold text-ui-shade" : "text-ui-muted"}`}
              numberOfLines={1}
            >
              {finalPreview}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-3">
            {user?.dob && <Meta icon="Cake" text={calculateAge(user?.dob)} />}
            {user?.gender && <Meta icon="UserRound" text={user.gender} />}
            {user?.distance != null && (
              <Meta icon="Footprints" text={`${user.distance.toFixed(1)}km`} />
            )}
          </View>
        )}
      </View>

      <View className="ml-3 items-end gap-2">
        <Text className={`text-xs font-medium ${unreadCount > 0 ? "text-ui-highlight" : "text-ui-muted"}`}>
          {formatInboxDate(room.lastMessageAt)}
        </Text>
        {unreadCount > 0 ? (
          <View className="h-6 min-w-6 items-center justify-center rounded-full bg-ui-highlight px-1.5">
            <Text className="text-xs font-bold text-ui-light">{unreadCount > 99 ? "99+" : unreadCount}</Text>
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

export const Meta = React.memo(function Meta({ icon, text }: MetaProps) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon name={icon} size={16} className="!h-4 !w-4 text-ui-shade" />
      <Text className="text-xs font-medium text-ui-muted">{text}</Text>
    </View>
  );
});

const InboxState = ({
  mode,
  type,
  onAction,
}: {
  mode: InboxTab;
  type: "empty" | "error";
  onAction?: () => void;
}) => {
  const isError = type === "error";
  const title = isError
    ? "Messages are taking a moment"
    : mode === "archive"
      ? "Your archive is clear"
      : "Your next conversation starts here";
  const description = isError
    ? "We couldn't refresh your conversations. Check your connection and try again."
    : mode === "archive"
      ? "Chats you archive will stay safely tucked away here."
      : "Explore new connections and your active chats will appear here.";

  return (
    <View className="mt-6 items-center rounded-[28px] border border-ui-border bg-ui-light px-6 py-8">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-ui-highlight/10">
        <Icon
          name={isError ? "CloudOff" : mode === "archive" ? "Archive" : "MessageCircleHeart"}
          size={26}
          color={COLORS.highlight}
        />
      </View>
      <Text className="mt-4 text-center text-xl font-bold text-ui-shade" accessibilityRole="header">
        {title}
      </Text>
      <Text className="mt-2 text-center text-sm leading-5 text-ui-muted">
        {description}
      </Text>
      {isError && onAction ? (
        <Pressable
          onPress={onAction}
          className="mt-5 min-h-12 items-center justify-center rounded-full bg-ui-highlight px-6 active:opacity-75"
          accessibilityRole="button"
          accessibilityLabel="Retry loading conversations"
        >
          <Text className="font-semibold text-ui-light">Try again</Text>
        </Pressable>
      ) : !isError && mode === "active" ? (
        <Link href="/explore" asChild>
          <Pressable
            className="mt-5 min-h-12 flex-row items-center justify-center gap-2 rounded-full bg-ui-highlight px-6 active:opacity-75"
            accessibilityRole="button"
            accessibilityLabel="Explore new connections"
          >
            <Icon name="Sparkles" size={17} color={COLORS.light} />
            <Text className="font-semibold text-ui-light">Explore connections</Text>
          </Pressable>
        </Link>
      ) : null}
    </View>
  );
};

const InboxSkeleton = () => (
  <View className="mt-1 gap-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <InboxItemSkeleton key={`chat-skeleton-${index}`} />
    ))}
  </View>
);

const InboxItemSkeleton = () => (
  <View className="rounded-[24px] border border-ui-border bg-ui-light px-3 py-3">
    <View className="flex-row items-center">
      <Skeleton width={56} height={56} radius={20} />
      <View className="flex-1 ml-4">
        <Skeleton width="55%" height={14} />
        <Skeleton width="82%" height={12} style={{ marginTop: 10 }} />
      </View>
      <View className="items-end ml-3">
        <Skeleton width={58} height={11} />
        <Skeleton
          width={24}
          height={24}
          radius={999}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  </View>
);
