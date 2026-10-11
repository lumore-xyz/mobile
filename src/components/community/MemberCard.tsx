import type { LocationRoomMember } from "@/src/features/community/types";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import getAgeFromDate from "@/src/utils/helpers/getAgeFromDate";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function MemberCard({ member }: { member: LocationRoomMember }) {
  const displayName = member.nickname || member.username || "Lumore User";
  const [failedPhoto, setFailedPhoto] = useState(false);
  useEffect(() => setFailedPhoto(false), [member.profilePicture]);
  const detailText = [
    member.dob ? `${getAgeFromDate(member.dob)} yrs` : null,
    member.gender,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <View className="mb-3 flex-row items-center rounded-[24px] border border-ui-parchment bg-ui-paper p-3">
      <View className="mr-3 h-12 w-12 overflow-hidden rounded-full bg-ui-forest/10">
        {member.profilePicture && !failedPhoto ? (
          <Image
            source={{ uri: member.profilePicture }}
            contentFit="cover"
            className="h-full w-full"
            style={StyleSheet.absoluteFillObject}
            onError={() => setFailedPhoto(true)}
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text className="text-xl font-bold text-ui-forest">
              {displayName.charAt(0)}
            </Text>
          </View>
        )}
      </View>
      <View className="flex-1">
        <Text className="font-bold text-ui-ink">{displayName}</Text>
        <Text className="text-sm text-ui-slate">
          {detailText || "Waiting in the pool"}
        </Text>
      </View>
      <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-champagne/30">
        <Icon name="Sparkles" size={16} color={COLORS.ink} />
      </View>
    </View>
  );
}
