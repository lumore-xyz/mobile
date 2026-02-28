import { CHAT_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import MobileNav from "@/src/components/MobileNav";
import { useUser } from "@/src/hooks/useUser";
import { fetchIbox } from "@/src/libs/apis";
import Icon from "@/src/libs/Icon";
import { useSocket } from "@/src/service/context/SocketContext";
import { getUser } from "@/src/service/storage";
import { calculateAge } from "@/src/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

const ChatInbox = () => {
  const currentUser = getUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket, revalidateSocket } = useSocket();
  const { user, isLoading: gettingUser } = useUser(currentUser?._id);

  const {
    data: rooms = [],
    isLoading,
    error,
  } = useQuery<any[]>({
    queryKey: ["inbox", "active"],
    queryFn: () => fetchIbox("active"),
    enabled: !!currentUser,
  });

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
          <TouchableOpacity onPress={() => router.push("/feedback")}>
            <Text className="text-ui-highlight">Feedback</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row bg-ui-shade/5 rounded-xl p-2 mb-3">
          <View className="flex-1 py-2 rounded-lg bg-ui-light shadow-sm">
            <Text className="text-center font-medium text-ui-shade">Active</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/chat/archive")}
            className="flex-1 py-2 rounded-lg"
          >
            <Text className="text-center font-medium text-ui-shade">Archived</Text>
          </TouchableOpacity>
        </View>

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

export const Inbox = ({ user, rooms, isLoading, error }: any) => {
  if (isLoading) {
    return <Text className="text-center mt-10 text-ui-shade">Fetching your chats...</Text>;
  }

  if (error || !rooms?.length) {
    return <Text className="text-center mt-10 text-ui-shade">No chats here yet</Text>;
  }

  return (
    <FlatList
      data={rooms}
      keyExtractor={(room) => room._id}
      contentContainerStyle={{ paddingBottom: 16 }}
      className="flex-1"
      renderItem={({ item: room }) => {
        const matchedUser = room.participants.find((p: any) => p._id !== user?._id);
        return <UserChat room={room} matchedUser={matchedUser} />;
      }}
    />
  );
};

const decodeLastMessage = (room: any) => {
  const lastMessage = room?.lastMessage;
  if (!lastMessage) return "";

  if (lastMessage.previewType === "image" || lastMessage.messageType === "image") {
    return "Photo";
  }

  if (!lastMessage.message) return "New message";
  return lastMessage.message;
};

export const UserChat = ({ room, matchedUser }: any) => {
  const { user, isLoading, error } = useUser(matchedUser?._id ?? "");
  const unreadCount = Number(room?.unreadCount || 0);
  const lastMessagePreview = useMemo(() => decodeLastMessage(room), [room]);
  const finalPreview = lastMessagePreview;
  const isUserUnavailable = Boolean(error);
  const displayName = isUserUnavailable
    ? "Lumore User"
    : user?.realName || user?.nickname || user?.username || "Lumore User";

  if (isLoading) {
    return (
      <View className="mt-2 px-3 py-3 rounded-2xl bg-white">
        <Text className="text-ui-shade">Loading...</Text>
      </View>
    );
  }

  const content = (
    <TouchableOpacity className="flex-row items-center px-3 py-3 rounded-2xl bg-white active:bg-ui-shade/5">
        <View className="relative mr-4">
          <View className="bg-ui-background border border-ui-shade/10 h-12 w-12 aspect-square rounded-full flex items-center justify-center overflow-hidden">
            {user?.profilePicture ? (
              <Image
                source={{ uri: user?.profilePicture }}
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
              <Icon type="Ionicons" name="lock-open-outline" className="h-4 w-4 text-ui-shade" />
            ) : (
              <Icon type="Ionicons" name="lock-closed-outline" className="h-4 w-4 text-ui-shade" />
            )}
          </View>
        </View>

        <View className="flex-1">
          <Text className="font-semibold text-base mb-1">
            {displayName}
          </Text>

          {finalPreview ? (
            <Text className="text-sm text-ui-shade/70" numberOfLines={1}>
              {finalPreview}
            </Text>
          ) : (
            <View className="flex-row items-center gap-3">
              {user?.dob && <Meta icon="cake.png" text={calculateAge(user?.dob)} />}
              {user?.gender && <Meta type="Ionicons" icon="person-outline" text={user.gender} />}
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
};

export const Meta = ({
  type,
  icon,
  text,
}: {
  type?: string;
  icon: string;
  text: string | number;
}) => (
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
