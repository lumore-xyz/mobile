import { Platform } from "react-native";

const resolveAdMobConfig = <
  T extends {
    ADMOB_ANDROID_APP_ID: string;
    ADMOB_IOS_APP_ID: string;
    ADMOB_ANDROID_INTERSTITIAL_ID: string;
    ADMOB_IOS_INTERSTITIAL_ID: string;
    ADMOB_ANDROID_REWARDED_UNIT_ID: string;
    ADMOB_IOS_REWARDED_UNIT_ID: string;
    PLAYSTORE_URL: string;
    APPSTORE_URL: string;
  },
>(
  baseConfig: T,
) => ({
  ...baseConfig,
  ADMOB_APP_ID:
    Platform.OS === "ios"
      ? baseConfig.ADMOB_IOS_APP_ID
      : baseConfig.ADMOB_ANDROID_APP_ID,
  ADMOB_INTERSTITIAL_UNIT_ID:
    Platform.OS === "ios"
      ? baseConfig.ADMOB_IOS_INTERSTITIAL_ID
      : baseConfig.ADMOB_ANDROID_INTERSTITIAL_ID,
  ADMOB_REWARDED_UNIT_ID:
    Platform.OS === "ios"
      ? baseConfig.ADMOB_IOS_REWARDED_UNIT_ID
      : baseConfig.ADMOB_ANDROID_REWARDED_UNIT_ID,
});

const developmentConfig = resolveAdMobConfig({
  // BASE_URL: "https://api.lumore.xyz",
  // SOCKET_URL: "https://api.lumore.xyz/api/chat",
  BASE_URL:
    Platform.OS === "android"
      ? "http://10.0.2.2:5000"
      : "http://localhost:5000",
  SOCKET_URL: "http://localhost:5000/api/chat",
  GOOGLE_WEB_CLIENT_ID:
    "681858960345-qghtb8olrkb2oh6q05ki37i6p8k8f9ga.apps.googleusercontent.com",
  IOS_URL_SCHEMA:
    "com.googleusercontent.apps.681858960345-t8llre06pgn2pegq01kjgukhmuiu46kf",
  ADMOB_ANDROID_APP_ID: "ca-app-pub-5845343690682759~9095410597",
  ADMOB_IOS_APP_ID: "ca-app-pub-5845343690682759~5136193710",
  ADMOB_ANDROID_INTERSTITIAL_ID: "ca-app-pub-5845343690682759/4569153863",
  ADMOB_ANDROID_REWARDED_UNIT_ID: "ca-app-pub-5845343690682759/7284110832",
  ADMOB_IOS_INTERSTITIAL_ID: "ca-app-pub-5845343690682759/3780189521",
  ADMOB_IOS_REWARDED_UNIT_ID: "ca-app-pub-5845343690682759/1563780217",
  ONESIGNAL_APP_ID: "1763039e-c3e6-45d6-846d-17cf9868f189",
  PLAYSTORE_URL:
    "https://play.google.com/store/apps/details?id=xyz.lumore.rebel",
  APPSTORE_URL:
    "https://play.google.com/store/apps/details?id=xyz.lumore.rebel",
});
const productionConfig = resolveAdMobConfig({
  BASE_URL: "https://api.lumore.xyz",
  SOCKET_URL: "https://api.lumore.xyz/api/chat",
  GOOGLE_WEB_CLIENT_ID:
    "681858960345-qghtb8olrkb2oh6q05ki37i6p8k8f9ga.apps.googleusercontent.com",
  IOS_URL_SCHEMA:
    "com.googleusercontent.apps.681858960345-t8llre06pgn2pegq01kjgukhmuiu46kf",
  ADMOB_ANDROID_APP_ID: "ca-app-pub-5845343690682759~9095410597",
  ADMOB_IOS_APP_ID: "ca-app-pub-5845343690682759~5136193710",
  ADMOB_ANDROID_INTERSTITIAL_ID: "ca-app-pub-5845343690682759/4569153863",
  ADMOB_ANDROID_REWARDED_UNIT_ID: "ca-app-pub-5845343690682759/7284110832",
  ADMOB_IOS_INTERSTITIAL_ID: "ca-app-pub-5845343690682759/3780189521",
  ADMOB_IOS_REWARDED_UNIT_ID: "ca-app-pub-5845343690682759/1563780217",
  ONESIGNAL_APP_ID: "1763039e-c3e6-45d6-846d-17cf9868f189",
  PLAYSTORE_URL:
    "https://play.google.com/store/apps/details?id=xyz.lumore.rebel",
  APPSTORE_URL:
    "https://play.google.com/store/apps/details?id=xyz.lumore.rebel",
});

const config = __DEV__ ? developmentConfig : productionConfig;
// const config = productionConfig;

export default config;
