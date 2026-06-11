import MobileNav from "@/src/components/MobileNav";
import Skeleton from "@/src/components/ui/Skeleton";
import Tabs, { TabItem } from "@/src/components/ui/Tabs";
import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import { useUser } from "@/src/hooks/useUser";
import { fetchIbox } from "@/src/libs/apis";
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
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type InboxTab = "active" | "archive";

interface InboxProps {
  user: any;
  rooms: any[];
  isLoading: boolean;
  error?: unknown;
}

interface UserChatProps {
  room: any;
  matchedUser: any;
}

interface MetaProps {
  type?: string;
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
  } = useQuery<any[]>({
    queryKey: ["inbox", "active"],
    queryFn: () => fetchIbox("active"),
    enabled: !!currentUser,
  });

  const {
    data: archiveRooms = [],
    isLoading: isLoadingArchive,
    error: archiveError,
  } = useQuery<any[]>({
    queryKey: ["inbox", "archive"],
    queryFn: () => fetchIbox("archive"),
    enabled: !!currentUser,
  });

  const rooms = activeTab === "active" ? activeRooms : archiveRooms;
  const isLoading = activeTab === "active" ? isLoadingActive : isLoadingArchive;
  const error = activeTab === "active" ? activeError : archiveError;

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

  return (
    <>
      <View className="flex-1 pt-6 px-4">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-3xl font-bold tracking-tight">Inbox</Text>
          <TouchableOpacity
            onPress={() => {
              triggerSelectionHaptic();
              router.push("/feedback");
            }}
            className="min-h-11 justify-center"
            hitSlop={8}
          >
            <Text className="text-ui-highlight">Feedback</Text>
          </TouchableOpacity>
        </View>

        <InboxTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <Inbox
          user={user}
          rooms={rooms}
          isLoading={isLoading || gettingUser}
          error={error}
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
}: {
  activeTab: InboxTab;
  onTabChange: (tab: InboxTab) => void;
}) {
  const tabs: TabItem[] = useMemo(
    () => [
      { key: "active", label: "Active" },
      { key: "archive", label: "Archived" },
    ],
    [],
  );

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onSelect={(key) => onTabChange(key as InboxTab)}
      showBadges={false}
      hapticFeedback={true}
    />
  );
});

export const Inbox = React.memo(function Inbox({
  user,
  rooms,
  isLoading,
  error,
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

  if (error || !rooms?.length) {
    return (
      <Text className="text-center mt-10 text-ui-shade">No chats here yet</Text>
    );
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(room) => String(room._id)}
      contentContainerStyle={{ paddingBottom: 20 }}
      className="flex-1"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={7}
      removeClippedSubviews={Platform.OS === "android"}
      renderItem={renderItem}
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

export const UserChat = React.memo(function UserChat({
  room,
  matchedUser,
}: UserChatProps) {
  const { user, isLoading, error } = useUser(matchedUser?._id ?? "");
  const unreadCount = Number(room?.unreadCount || 0);
  const lastMessagePreview = useMemo(() => decodeLastMessage(room), [room]);
  const finalPreview = lastMessagePreview;
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
    <TouchableOpacity className="flex-row items-center px-3 py-3 rounded-2xl bg-white active:bg-ui-shade/5">
      <View className="relative mr-4">
        <View className="bg-ui-background border border-ui-shade/10 h-12 w-12 aspect-square rounded-full flex items-center justify-center overflow-hidden">
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
                borderRadius: 9999,
              }}
              alt={displayName}
            />
          ) : (
            <Text className="text-3xl text-ui-shade">
              {displayName.charAt(0)}
            </Text>
          )}
        </View>

        <View className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-ui-light flex flex-row items-center justify-center">
          {user?.isViewerUnlockedByUser && !isUserUnavailable ? (
            <Icon
              type="Ionicons"
              name="lock-open-outline"
              className="h-4 w-4 text-ui-shade"
            />
          ) : (
            <Icon
              type="Ionicons"
              name="lock-closed-outline"
              className="h-4 w-4 text-ui-shade"
            />
          )}
        </View>
      </View>

      <View className="flex-1">
        <View className="mb-1 flex-row items-center gap-2">
          <Text className="font-semibold text-base">{displayName}</Text>

          {isRoomMatch ? (
            <View className="self-start rounded-full bg-ui-highlight/10 px-2 py-0.5">
              <Text className="text-xs font-semibold text-ui-highlight">
                {roomMatchTitle}
              </Text>
            </View>
          ) : null}
        </View>

        {finalPreview ? (
          <Text className="text-sm text-ui-shade/70" numberOfLines={1}>
            {finalPreview}
          </Text>
        ) : (
          <View className="flex-row items-center gap-3">
            {user?.dob && (
              <Meta icon="cake.png" text={calculateAge(user?.dob)} />
            )}
            {user?.gender && (
              <Meta type="Ionicons" icon="person-outline" text={user.gender} />
            )}
            {user?.distance != null && (
              <Meta
                type="Ionicons"
                icon="footsteps-outline"
                text={`${user.distance.toFixed(1)}km`}
              />
            )}
          </View>
        )}
      </View>

      <View className="items-end gap-1 ml-3">
        <Text className="text-sm text-ui-shade">
          {new Date(room.lastMessageAt).toLocaleDateString()}
        </Text>
        {unreadCount > 0 ? (
          <View className="min-w-5 h-5 px-1 rounded-full bg-ui-highlight items-center justify-center">
            <Text className="text-xs text-white">{unreadCount}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return isUserUnavailable ? (
    <View className="mt-2 opacity-75">{content}</View>
  ) : (
    <Link className="mt-2" href={`/chat/${room._id}`} asChild>
      {content}
    </Link>
  );
});

export const Meta = React.memo(function Meta({ type, icon, text }: MetaProps) {
  return (
    <View className="flex-row items-center gap-1">
      <Icon
        type={type as any}
        name={icon as any}
        size={16}
        className="!h-4 !w-4 text-ui-shade"
      />
      <Text className="text-ui-shade">{text}</Text>
    </View>
  );
});

const InboxSkeleton = () => (
  <View className="mt-1">
    {Array.from({ length: 6 }).map((_, index) => (
      <InboxItemSkeleton key={`chat-skeleton-${index}`} />
    ))}
  </View>
);

const InboxItemSkeleton = () => (
  <View className="mt-2 px-3 py-3 rounded-2xl bg-white border border-ui-shade/10">
    <View className="flex-row items-center">
      <Skeleton width={48} height={48} radius={999} />
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
