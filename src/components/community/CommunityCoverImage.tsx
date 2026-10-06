import COMMUNITY_COVER from "@/assets/images/community-cover.jpg";
import { Image } from "expo-image";
import React, { useState } from "react";
import type { ImageStyle, StyleProp } from "react-native";

export default function CommunityCoverImage({
  uri,
  className,
  style,
}: {
  uri?: string | null;
  className: string;
  style?: StyleProp<ImageStyle>;
}) {
  const imageUri = uri?.trim();
  const [failedUri, setFailedUri] = useState<string>();
  const shouldUseRemoteImage = Boolean(imageUri && imageUri !== failedUri);

  return (
    <Image
      source={
        imageUri && shouldUseRemoteImage ? { uri: imageUri } : COMMUNITY_COVER
      }
      contentFit="cover"
      transition={180}
      recyclingKey={
        imageUri && shouldUseRemoteImage
          ? imageUri
          : "community-cover-fallback"
      }
      onError={() => {
        if (imageUri) setFailedUri(imageUri);
      }}
      accessible={false}
      className={className}
      style={style}
    />
  );
}
