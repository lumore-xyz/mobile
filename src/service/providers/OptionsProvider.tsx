import { fetchPublicOptions } from "@/src/libs/apis";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DynamicOptionsPayload,
  applyDynamicOptions,
  getCachedOptionsVersion,
  loadDynamicOptionsFromCache,
  saveDynamicOptionsToCache,
  setCachedOptionsVersion,
} from "@/src/libs/options";

const OPTIONS_POLL_INTERVAL = 60_000;

type GenericRecord = Record<string, unknown>;

const asRecord = (value: unknown): GenericRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as GenericRecord)
    : {};

const pickFirst = <T,>(...values: T[]) =>
  values.find((value) => value !== undefined && value !== null);

const extractPayload = (responseValue: unknown): DynamicOptionsPayload | null => {
  const responseData = asRecord(responseValue);
  const data = asRecord(responseData.data);
  const container = pickFirst(
    data.options,
    responseData.options,
    responseData.data,
  );

  if (!container || typeof container !== "object" || Array.isArray(container)) {
    return null;
  }

  const payload: DynamicOptionsPayload = {};
  Object.entries(container).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      (payload as GenericRecord)[key] = value;
    }
  });
  return payload;
};

const extractVersion = (responseValue: unknown): string | null => {
  const responseData = asRecord(responseValue);
  const data = asRecord(responseData.data);
  const version = pickFirst(
    data.version,
    responseData.version,
    data.optionsVersion,
    responseData.optionsVersion,
    data.updatedAt,
    responseData.updatedAt,
  );
  return typeof version === "string" && version.trim() ? version : null;
};

export const OptionsProvider = ({ children }: { children: React.ReactNode }) => {
  const isFetchingRef = useRef(false);
  const optionsVersionRef = useRef<string | null>(null);
  const [, forceRender] = useState(0);

  const fetchAndApplyOptions = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const response = await fetchPublicOptions();
      const payload = extractPayload(response);
      if (!payload) return;

      applyDynamicOptions(payload);

      const version = extractVersion(response) || optionsVersionRef.current || undefined;
      saveDynamicOptionsToCache(payload, version);

      if (version && version !== optionsVersionRef.current) {
        optionsVersionRef.current = version;
        setCachedOptionsVersion(version);
      }

      // Option arrays are mutated in place; force a rerender so consumers pick up changes.
      forceRender((prev) => prev + 1);
    } catch {
      // Keep defaults/cache when remote options are unavailable.
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadDynamicOptionsFromCache();
    optionsVersionRef.current = getCachedOptionsVersion();
    forceRender((prev) => prev + 1);
    void fetchAndApplyOptions();

    const intervalId = setInterval(() => {
      void fetchAndApplyOptions();
    }, OPTIONS_POLL_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchAndApplyOptions]);

  return <>{children}</>;
};
