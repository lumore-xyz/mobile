import axios from "axios";
import { Platform } from "react-native";
import { storage } from "./storage";

type FeatureFlagValue = boolean | number | string | null;
export type FeatureFlags = Record<string, FeatureFlagValue>;

export type RuntimeEditableConfig = {
  BASE_URL: string;
  SOCKET_URL: string;
  GOOGLE_WEB_CLIENT_ID: string;
  IOS_URL_SCHEMA: string;
  ADMOB_ANDROID_INTERSTITIAL_ID: string;
  ADMOB_IOS_INTERSTITIAL_ID: string;
  ADMOB_ANDROID_REWARDED_UNIT_ID: string;
  ADMOB_IOS_REWARDED_UNIT_ID: string;
  ONESIGNAL_APP_ID: string;
  PLAYSTORE_URL: string;
  APPSTORE_URL: string;
  featureFlags: FeatureFlags;
};

type StaticConfig = {
  ADMOB_ANDROID_APP_ID: string;
  ADMOB_IOS_APP_ID: string;
};

type BaseConfig = RuntimeEditableConfig & StaticConfig;

export type AppConfig = BaseConfig & {
  ADMOB_APP_ID: string;
  ADMOB_INTERSTITIAL_UNIT_ID: string;
  ADMOB_REWARDED_UNIT_ID: string;
};

const RUNTIME_CONFIG_ENDPOINT_PATH = "/api/status/mobile-config";
const RUNTIME_CONFIG_CACHE_KEY = "lumore:mobile-runtime-config";
const RUNTIME_CONFIG_VERSION_KEY = "lumore:mobile-runtime-config-version";
const RUNTIME_CONFIG_UPDATED_AT_KEY = "lumore:mobile-runtime-config-updated-at";
const DEFAULT_REMOTE_FETCH_TIMEOUT_MS = 3000;

const resolveAdMobConfig = <
  T extends {
    ADMOB_ANDROID_APP_ID: string;
    ADMOB_IOS_APP_ID: string;
    ADMOB_ANDROID_INTERSTITIAL_ID: string;
    ADMOB_IOS_INTERSTITIAL_ID: string;
    ADMOB_ANDROID_REWARDED_UNIT_ID: string;
    ADMOB_IOS_REWARDED_UNIT_ID: string;
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

const developmentBaseConfig: BaseConfig = {
  BASE_URL: "https://api.lumore.xyz",
  SOCKET_URL: "https://api.lumore.xyz/api/chat",
  GOOGLE_WEB_CLIENT_ID:
    "681858960345-vdjvn8t4sh9du8p396bv9krcf3irjc6s.apps.googleusercontent.com",
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
    "https://play.google.com/store/apps/details?id=xyz.lumore.www.twa",
  APPSTORE_URL:
    "https://play.google.com/store/apps/details?id=xyz.lumore.www.twa",
  featureFlags: {},
};

const productionBaseConfig: BaseConfig = {
  BASE_URL: "https://api.lumore.xyz",
  SOCKET_URL: "https://api.lumore.xyz/api/chat",
  GOOGLE_WEB_CLIENT_ID:
    "681858960345-vdjvn8t4sh9du8p396bv9krcf3irjc6s.apps.googleusercontent.com",
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
    "https://play.google.com/store/apps/details?id=xyz.lumore.www.twa",
  APPSTORE_URL:
    "https://play.google.com/store/apps/details?id=xyz.lumore.www.twa",
  featureFlags: {},
};

const initialBaseConfig = __DEV__ ? developmentBaseConfig : productionBaseConfig;
const bootstrapBaseUrl = initialBaseConfig.BASE_URL;

let currentBaseConfig: BaseConfig = { ...initialBaseConfig };
let currentConfig: AppConfig = resolveAdMobConfig(currentBaseConfig);

const runtimeConfigKeys: Array<keyof RuntimeEditableConfig> = [
  "BASE_URL",
  "SOCKET_URL",
  "GOOGLE_WEB_CLIENT_ID",
  "IOS_URL_SCHEMA",
  "ADMOB_ANDROID_INTERSTITIAL_ID",
  "ADMOB_IOS_INTERSTITIAL_ID",
  "ADMOB_ANDROID_REWARDED_UNIT_ID",
  "ADMOB_IOS_REWARDED_UNIT_ID",
  "ONESIGNAL_APP_ID",
  "PLAYSTORE_URL",
  "APPSTORE_URL",
  "featureFlags",
];

const runtimeConfigKeySet = new Set(runtimeConfigKeys as string[]);
const urlRuntimeConfigKeys = new Set<keyof RuntimeEditableConfig>([
  "BASE_URL",
  "SOCKET_URL",
  "PLAYSTORE_URL",
  "APPSTORE_URL",
]);
const requiredUrlRuntimeConfigKeys = new Set<keyof RuntimeEditableConfig>([
  "BASE_URL",
  "SOCKET_URL",
]);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isFeatureFlagValue = (value: unknown): value is FeatureFlagValue =>
  value === null ||
  typeof value === "boolean" ||
  typeof value === "number" ||
  typeof value === "string";

const normalizeFeatureFlags = (value: unknown): FeatureFlags | null => {
  if (!isPlainObject(value)) return null;

  const normalized: FeatureFlags = {};
  Object.entries(value).forEach(([key, rawValue]) => {
    const normalizedKey = String(key || "").trim();
    if (!normalizedKey || !isFeatureFlagValue(rawValue)) return;
    normalized[normalizedKey] =
      typeof rawValue === "string" ? rawValue.trim() : rawValue;
  });

  return normalized;
};

const normalizeRuntimeConfigPatch = (
  payload: unknown,
): Partial<RuntimeEditableConfig> | null => {
  if (!isPlainObject(payload)) return null;

  const normalizedPatch: Partial<RuntimeEditableConfig> = {};

  Object.entries(payload).forEach(([key, value]) => {
    if (!runtimeConfigKeySet.has(key)) return;

    if (key === "featureFlags") {
      const featureFlags = normalizeFeatureFlags(value);
      if (featureFlags) {
        normalizedPatch.featureFlags = featureFlags;
      }
      return;
    }

    if (typeof value !== "string") return;

    const trimmedValue = value.trim();
    if (
      requiredUrlRuntimeConfigKeys.has(key as keyof RuntimeEditableConfig) &&
      !trimmedValue
    ) {
      return;
    }

    if (urlRuntimeConfigKeys.has(key as keyof RuntimeEditableConfig) && trimmedValue) {
      try {
        const parsed = new URL(trimmedValue);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return;
        }
      } catch {
        return;
      }
    }

    (normalizedPatch as Record<string, unknown>)[key] = trimmedValue;
  });

  return Object.keys(normalizedPatch).length ? normalizedPatch : null;
};

const getRuntimeConfigSnapshot = (): Partial<RuntimeEditableConfig> => {
  const snapshot: Partial<RuntimeEditableConfig> = {};
  runtimeConfigKeys.forEach((key) => {
    (snapshot as Record<string, unknown>)[key] = currentBaseConfig[key];
  });
  return snapshot;
};

const applyRuntimeConfigPatch = (patch: Partial<RuntimeEditableConfig>) => {
  if (!patch || !Object.keys(patch).length) return false;

  currentBaseConfig = {
    ...currentBaseConfig,
    ...patch,
    featureFlags:
      patch.featureFlags !== undefined
        ? patch.featureFlags
        : currentBaseConfig.featureFlags,
  };

  currentConfig = resolveAdMobConfig({ ...currentBaseConfig });
  return true;
};

const buildRemoteConfigUrl = (baseUrl: string, path: string) => {
  const normalizedBase = String(baseUrl || "").trim().replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const persistRuntimeConfigSnapshot = (version?: string | null, updatedAt?: string | null) => {
  storage.set(RUNTIME_CONFIG_CACHE_KEY, JSON.stringify(getRuntimeConfigSnapshot()));

  if (version) {
    storage.set(RUNTIME_CONFIG_VERSION_KEY, version);
  } else {
    storage.remove(RUNTIME_CONFIG_VERSION_KEY);
  }

  if (updatedAt) {
    storage.set(RUNTIME_CONFIG_UPDATED_AT_KEY, updatedAt);
  } else {
    storage.remove(RUNTIME_CONFIG_UPDATED_AT_KEY);
  }
};

export const getConfig = () => currentConfig;

export const getBootstrapBaseUrl = () => bootstrapBaseUrl;

export const getCachedRuntimeConfigVersion = () =>
  storage.getString(RUNTIME_CONFIG_VERSION_KEY) || null;

export const getCachedRuntimeConfigUpdatedAt = () =>
  storage.getString(RUNTIME_CONFIG_UPDATED_AT_KEY) || null;

export const loadRuntimeConfigFromCache = () => {
  const raw = storage.getString(RUNTIME_CONFIG_CACHE_KEY);
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as unknown;
    const patch = normalizeRuntimeConfigPatch(parsed);
    if (!patch) return false;
    return applyRuntimeConfigPatch(patch);
  } catch {
    return false;
  }
};

export const fetchAndApplyRemoteRuntimeConfig = async ({
  timeoutMs = DEFAULT_REMOTE_FETCH_TIMEOUT_MS,
}: {
  timeoutMs?: number;
} = {}) => {
  const endpointUrl = buildRemoteConfigUrl(
    getBootstrapBaseUrl(),
    RUNTIME_CONFIG_ENDPOINT_PATH,
  );

  const response = await axios.get(endpointUrl, {
    timeout: timeoutMs,
  });

  const responseBody = response?.data;
  const dataNode = isPlainObject(responseBody?.data)
    ? responseBody.data
    : responseBody;
  const configNode = isPlainObject(dataNode?.config) ? dataNode.config : dataNode;

  const patch = normalizeRuntimeConfigPatch(configNode);
  if (!patch) return false;

  const didApplyPatch = applyRuntimeConfigPatch(patch);
  if (!didApplyPatch) return false;

  const version =
    typeof dataNode?.version === "string"
      ? dataNode.version
      : typeof responseBody?.version === "string"
        ? responseBody.version
        : null;

  const updatedAt =
    typeof dataNode?.updatedAt === "string"
      ? dataNode.updatedAt
      : typeof responseBody?.updatedAt === "string"
        ? responseBody.updatedAt
        : null;

  persistRuntimeConfigSnapshot(version, updatedAt);
  return true;
};

export const loadRuntimeConfigBlocking = async ({
  timeoutMs = DEFAULT_REMOTE_FETCH_TIMEOUT_MS,
}: {
  timeoutMs?: number;
} = {}) => {
  loadRuntimeConfigFromCache();

  try {
    await fetchAndApplyRemoteRuntimeConfig({ timeoutMs });
  } catch {
    // Keep startup resilient: cached/default config is enough to proceed.
  }

  return getConfig();
};

const configProxy = new Proxy({} as AppConfig, {
  get(_target, property) {
    return getConfig()[property as keyof AppConfig];
  },
  ownKeys() {
    return Reflect.ownKeys(getConfig());
  },
  getOwnPropertyDescriptor(_target, property) {
    return {
      configurable: true,
      enumerable: true,
      value: getConfig()[property as keyof AppConfig],
    };
  },
});

export default configProxy;
