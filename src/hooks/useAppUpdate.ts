import * as Application from "expo-application";
import Constants from "expo-constants";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { storage } from "../service/storage";
import {
  AppVersionConfig,
  AppVersionPlatform,
  fetchAppVersionConfig,
  getCachedAppVersionKey,
} from "../service/appUpdate";
import {
  compareVersions,
  isVersionLessThan,
} from "../utils/version";

export type AppUpdateStatus = "idle" | "checking" | "up-to-date" | "optional" | "force";

export type AppUpdateState = {
  status: AppUpdateStatus;
  currentVersion: string;
  latestVersion: string | null;
  minimumSupportedVersion: string | null;
  forceUpdate: boolean;
  storeUrl: string | null;
  updateTitle: string;
  updateMessage: string;
  config: AppVersionConfig | null;
  error: unknown;
  refresh: () => Promise<void>;
};

const getPlatformKey = (): AppVersionPlatform =>
  Platform.OS === "ios" ? "ios" : "android";

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

type CachedEntry = {
  cachedAt: number;
  config: AppVersionConfig | null;
  appliedAt: number;
};

const readCache = (platform: AppVersionPlatform): CachedEntry | null => {
  try {
    const raw = storage.getString(getCachedAppVersionKey(platform));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CachedEntry>;
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.cachedAt !== "number") return null;
    return {
      cachedAt: parsed.cachedAt,
      config: (parsed.config as AppVersionConfig | null) ?? null,
      appliedAt:
        typeof parsed.appliedAt === "number" ? parsed.appliedAt : 0,
    };
  } catch {
    return null;
  }
};

const writeCache = (
  platform: AppVersionPlatform,
  config: AppVersionConfig | null,
) => {
  try {
    const entry: CachedEntry = {
      cachedAt: Date.now(),
      config,
      appliedAt: Date.now(),
    };
    storage.set(getCachedAppVersionKey(platform), JSON.stringify(entry));
  } catch {
    // Cache failures are non-fatal.
  }
};

const clearCache = (platform: AppVersionPlatform) => {
  try {
    storage.remove(getCachedAppVersionKey(platform));
  } catch {
    // Ignore.
  }
};

export const useAppUpdate = (): AppUpdateState => {
  const platform = useMemo(getPlatformKey, []);
  const [status, setStatus] = useState<AppUpdateStatus>("idle");
  const [currentVersion] = useState(
    () =>
      Application.nativeApplicationVersion ||
      Constants.expoConfig?.version ||
      "0.0.0",
  );
  const [config, setConfig] = useState<AppVersionConfig | null>(null);
  const [error, setError] = useState<unknown>(null);

  const evaluateStatus = (
    nextConfig: AppVersionConfig | null,
    installed: string,
  ): AppUpdateStatus => {
    if (!nextConfig) return "up-to-date";

    if (isVersionLessThan(installed, nextConfig.minimumSupportedVersion)) {
      return "force";
    }

    if (nextConfig.forceUpdate && isVersionLessThan(installed, nextConfig.latestVersion)) {
      return "force";
    }

    if (compareVersions(installed, nextConfig.latestVersion) < 0) {
      return "optional";
    }

    return "up-to-date";
  };

  const refresh = async () => {
    if (!currentVersion) return;
    setStatus("checking");
    setError(null);
    const nextConfig = await fetchAppVersionConfig(platform);
    if (nextConfig === null) {
      setStatus("up-to-date");
      setConfig(null);
      return;
    }
    writeCache(platform, nextConfig);
    setConfig(nextConfig);
    setStatus(evaluateStatus(nextConfig, currentVersion));
  };

  useEffect(() => {
    if (!currentVersion) return;
    let cancelled = false;

    const cached = readCache(platform);
    const isCacheFresh =
      cached && Date.now() - cached.cachedAt < CACHE_TTL_MS;

    if (cached?.config) {
      setConfig(cached.config);
      setStatus(evaluateStatus(cached.config, currentVersion));
    }

    const runCheck = async () => {
      try {
        setStatus((prev) => (prev === "idle" ? "checking" : prev));
        const nextConfig = await fetchAppVersionConfig(platform);
        if (cancelled) return;
        if (nextConfig === null) {
          if (!cached?.config) setStatus("up-to-date");
          return;
        }
        writeCache(platform, nextConfig);
        setConfig(nextConfig);
        setStatus(evaluateStatus(nextConfig, currentVersion));
      } catch (err) {
        if (cancelled) return;
        setError(err);
        setStatus(cached?.config ? evaluateStatus(cached.config, currentVersion) : "up-to-date");
      }
    };

    if (!isCacheFresh) {
      void runCheck();
    }

    return () => {
      cancelled = true;
    };
  }, [platform, currentVersion]);

  const storeUrl = useMemo(() => {
    if (!config) return null;
    if (platform === "ios") {
      return config.appStoreUrl || config.playStoreUrl || null;
    }
    return config.playStoreUrl || config.appStoreUrl || null;
  }, [config, platform]);

  return {
    status,
    currentVersion,
    latestVersion: config?.latestVersion ?? null,
    minimumSupportedVersion: config?.minimumSupportedVersion ?? null,
    forceUpdate: status === "force",
    storeUrl,
    updateTitle:
      config?.updateTitle || "Update available",
    updateMessage:
      config?.updateMessage ||
      "A new version of the app is available. Please update for the best experience.",
    config,
    error,
    refresh,
  };
};

export const clearAppUpdateCache = (platform?: AppVersionPlatform) => {
  clearCache(platform || getPlatformKey());
};
