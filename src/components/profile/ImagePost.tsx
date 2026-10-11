import ExpandablePostText from "@/src/components/profile/ExpandablePostText";
import { ProfilePost } from "@/src/domain/profile/types";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Text, View } from "react-native";

const ImagePost = ({ post }: { post: ProfilePost }) => {
  const imageSource = post?.content?.imageUrls || post?.content?.imageUrl;
  const imageUrl = Array.isArray(imageSource) ? imageSource[0] : imageSource;
  const [imageAspectRatio, setImageAspectRatio] = useState(1);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  return (
    <View>
      {imageUrl && !imageUnavailable ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-full"
          accessibilityLabel="User created profile post image"
          contentFit="cover"
          transition={180}
          cachePolicy="memory-disk"
          style={{
            aspectRatio: Math.max(0.78, Math.min(imageAspectRatio, 1.12)),
          }}
          onError={() => setImageUnavailable(true)}
          onLoad={(event) => {
            const width = event?.source?.width;
            const height = event?.source?.height;
            if (width && height) {
              setImageAspectRatio(width / height);
            }
          }}
        />
      ) : (
        <View className="h-72 items-center justify-center bg-ui-midnight px-6">
          <View className="mb-3 h-11 w-11 items-center justify-center rounded-full bg-ui-aubergine/10">
            <Icon name="ImageOff" size={18} color={COLORS.aubergine} />
          </View>
          <Text className="text-sm font-medium text-ui-paper">
            Image unavailable
          </Text>
        </View>
      )}
      {post?.content?.caption ? (
        <View className="bg-ui-midnight px-5 pb-5 pt-4">
          <View className="mb-3 h-1 w-10 rounded-full bg-ui-champagne" />
          <ExpandablePostText
            text={post.content.caption}
            numberOfLines={3}
            className="text-[21px] font-bold leading-7 text-ui-paper"
          />
        </View>
      ) : null}
    </View>
  );
};

export default ImagePost;
