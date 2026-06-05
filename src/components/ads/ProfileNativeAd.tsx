import { COLORS } from "@/src/libs/constants/theme";
import config from "@/src/service/config";
import React, { memo, useEffect, useMemo, useState } from "react";
import { Image, Text, View } from "react-native";
import {
  NativeAd,
  NativeAdChoicesPlacement,
  NativeAdView,
  NativeAsset,
  NativeAssetType,
  NativeMediaAspectRatio,
  NativeMediaView,
  TestIds,
} from "react-native-google-mobile-ads";

const ProfileNativeAd = () => {
  const adUnitId = useMemo(
    () =>
      __DEV__ ? TestIds.NATIVE : config.ADMOB_PROFILE_NATIVE_UNIT_ID,
    [],
  );
  const [nativeAd, setNativeAd] = useState<NativeAd | null>(null);

  useEffect(() => {
    if (!adUnitId) return;

    let isMounted = true;
    let loadedAd: NativeAd | null = null;

    NativeAd.createForAdRequest(adUnitId, {
      adChoicesPlacement: NativeAdChoicesPlacement.TOP_RIGHT,
      aspectRatio: NativeMediaAspectRatio.LANDSCAPE,
      requestNonPersonalizedAdsOnly: true,
      startVideoMuted: true,
    })
      .then((ad) => {
        loadedAd = ad;
        if (isMounted) {
          setNativeAd(ad);
          return;
        }
        ad.destroy();
      })
      .catch(() => {
        if (isMounted) {
          setNativeAd(null);
        }
      });

    return () => {
      isMounted = false;
      loadedAd?.destroy();
    };
  }, [adUnitId]);

  if (!nativeAd) return null;

  return (
    <NativeAdView
      nativeAd={nativeAd}
      className="mt-4 overflow-hidden rounded-2xl border border-ui-shade/10 bg-white"
    >
      <View className="p-3">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="rounded bg-ui-highlight px-2 py-1">
            <Text className="text-[10px] font-semibold uppercase text-white">
              Ad
            </Text>
          </View>
          <Text className="pr-7 text-[10px] text-ui-shade/50">Sponsored</Text>
        </View>

        {nativeAd.mediaContent ? (
          <NativeMediaView
            resizeMode="cover"
            className="mb-3 h-36 w-full overflow-hidden rounded-xl bg-ui-light"
          />
        ) : null}

        <View className="flex-row gap-3">
          {nativeAd.icon?.url ? (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image
                source={{ uri: nativeAd.icon.url }}
                className="h-12 w-12 rounded-md bg-ui-light"
                resizeMode="cover"
              />
            </NativeAsset>
          ) : null}

          <View className="min-w-0 flex-1">
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text
                className="text-base font-semibold text-ui-shade"
                numberOfLines={2}
              >
                {nativeAd.headline}
              </Text>
            </NativeAsset>

            {nativeAd.advertiser ? (
              <NativeAsset assetType={NativeAssetType.ADVERTISER}>
                <Text className="mt-0.5 text-xs text-ui-shade/60">
                  {nativeAd.advertiser}
                </Text>
              </NativeAsset>
            ) : null}

            {nativeAd.body ? (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text className="mt-2 text-sm text-ui-shade" numberOfLines={2}>
                  {nativeAd.body}
                </Text>
              </NativeAsset>
            ) : null}
          </View>
        </View>

        {nativeAd.callToAction ? (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <View
              className="mt-3 min-h-11 items-center justify-center rounded-md px-4"
              style={{ backgroundColor: COLORS.highlight }}
            >
              <Text className="text-sm font-semibold text-white">
                {nativeAd.callToAction}
              </Text>
            </View>
          </NativeAsset>
        ) : null}
      </View>
    </NativeAdView>
  );
};

export default memo(ProfileNativeAd);
