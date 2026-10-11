import type { ProfileUser } from "@/src/domain/profile/types";
import { useAd } from "@/src/hooks/useAd";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { useChat } from "@/src/service/context/ChatContext";
import { Image } from "expo-image";
import getAgeFromDate from "@/src/utils/helpers/getAgeFromDate";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import ChatSafetySheet from "./ChatSafetySheet";

interface ChatHeaderProps {
  user: ProfileUser | undefined;
  onEndChat: () => void;
  currentUserId: string;
}

const ChatHeader = ({
  user,
  onEndChat,
  currentUserId,
}: ChatHeaderProps) => {
  const { roomId, matchedUser, lockProfile, unlockProfile, isActive, roomData } =
    useChat();
  const { showRewarded } = useAd();
  const isRoomMatch = roomData?.source === "location_room";
  const roomMatchTitle =
    roomData?.sourceMetadata?.title ||
    roomData?.locationRoom?.title ||
    "Community";
  const displayName = user?.isViewerUnlockedByUser
    ? user.realName || user.nickname || user.username || "Lumore User"
    : user?.nickname || "Lumore User";

  const [isUnlocked, setIsUnlocked] = useState(
    user?.isViewerUnlockedUser || false,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleUnlockProfile = async () => {
    if (!roomId || !currentUserId || !matchedUser) return;
    triggerSelectionHaptic();
    setIsUnlocked(true);
    unlockProfile(matchedUser._id);
  };

  const handleLockProfile = async () => {
    if (!roomId || !currentUserId || !matchedUser) return;
    triggerSelectionHaptic();
    setIsUnlocked(false);
    lockProfile(matchedUser._id);
  };

  const navigateBack = () => {
    triggerSelectionHaptic();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/chat");
    }
  };

  const navigateToProfile = async () => {
    if (!user?._id) return;
    triggerSelectionHaptic();
    await showRewarded();
    router.push({
      pathname: "/(subpage)/profile/[userId]",
      params: { userId: user._id },
    });
  };

  const openSheet = () => {
    triggerSelectionHaptic();
    setIsSheetOpen(true);
  };

  return (
    <View className="w-full flex-row items-center justify-between border-b border-ui-parchment bg-ui-paper px-2 py-2.5">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <Pressable
          onPress={navigateBack}
          className="h-11 w-11 items-center justify-center rounded-full active:bg-ui-forest/5"
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel="Back to inbox"
        >
          <Icon name="ArrowLeft" size={24} className="cursor-pointer" />
        </Pressable>
        <View style={{ position: "relative" }}>
          <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-ui-porcelain">
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                blurRadius={user.isViewerUnlockedByUser ? 0 : 12}
                contentFit="cover"
                transition={150}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 9999,
                }}
                accessible
                accessibilityLabel={`Profile photo of ${displayName}`}
              />
            ) : (
              <Text className="text-3xl text-ui-ink">{displayName[0]}</Text>
            )}
          </View>
          <View
            style={{ position: "absolute", bottom: 0, right: 0 }}
            className="h-4 w-4 items-center justify-center rounded-full bg-ui-paper"
          >
            <Icon
              name={user?.isViewerUnlockedByUser ? "LockOpen" : "Lock"}
              color={COLORS.slate}
              size={10}
            />
          </View>
        </View>
        <View className="min-w-0 flex-1">
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => void navigateToProfile()}
              className="min-w-0 flex-1 justify-center"
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="View profile"
            >
              <Text className="text-lg font-bold text-ui-ink" numberOfLines={1}>
                {displayName}
              </Text>
            </Pressable>
            {isRoomMatch ? (
              <View className="mt-0.5 self-start rounded-full bg-ui-forest/10 px-2 py-0.5">
                <Text className="text-xs font-semibold text-ui-forest">
                  {roomMatchTitle}
                </Text>
              </View>
            ) : null}
          </View>
          <View className="mt-1 flex-row flex-wrap items-center gap-2">
            {user?.dob ? (
              <View className="flex flex-shrink-0 flex-row items-center justify-center gap-1">
                <Icon name="CakeSlice" size={12} className="flex-shrink-0" />
                <Text className="text-xs font-medium text-ui-slate">
                  {getAgeFromDate(user.dob)}
                </Text>
              </View>
            ) : null}
            {user?.gender ? (
              <View className="flex flex-shrink-0 flex-row items-center justify-center gap-1">
                <Icon name="UserRound" size={12} />
                <Text className="text-xs font-medium capitalize text-ui-slate">
                  {user.gender}
                </Text>
              </View>
            ) : null}
            <View className="flex flex-shrink-0 flex-row items-center justify-center gap-1">
              <Icon name="Footprints" size={12} className="flex-shrink-0" />
              <Text className="text-xs font-medium text-ui-slate">
                {Number(user?.distance || 0).toFixed(1)} km
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="ml-1 flex-row items-center gap-1">
        <Pressable
          onPress={isUnlocked ? handleLockProfile : handleUnlockProfile}
          className="h-11 w-11 items-center justify-center rounded-full bg-ui-forest/5 active:opacity-70"
          hitSlop={4}
          accessibilityRole="button"
          accessibilityLabel={isUnlocked ? "Lock profile" : "Unlock profile"}
        >
          <Icon
            name={isUnlocked ? "LockOpen" : "Lock"}
            size={20}
            color={COLORS.forest}
          />
        </Pressable>
        {isActive ? (
          <Pressable
            onPress={openSheet}
            className="h-11 w-11 items-center justify-center rounded-full active:bg-ui-forest/5"
            hitSlop={4}
            accessibilityRole="button"
            accessibilityLabel="Open chat options"
          >
            <Icon name="EllipsisVertical" size={24} />
          </Pressable>
        ) : null}
      </View>
      <ChatSafetySheet
        isOpen={isSheetOpen}
        roomId={roomId}
        onClose={() => setIsSheetOpen(false)}
        onEndChat={onEndChat}
      />
    </View>
  );
};

export default ChatHeader;
