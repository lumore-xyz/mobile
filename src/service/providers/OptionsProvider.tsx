import { fetchPublicOptions } from "@/src/features/options/api";
import parseOptionsResponse from "@/src/features/options/parseOptionsResponse";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  applyDynamicOptions,
  getCachedOptionsVersion,
  loadDynamicOptionsFromCache,
  saveDynamicOptionsToCache,
  setCachedOptionsVersion,
} from "@/src/libs/options";

const OPTIONS_POLL_INTERVAL = 60_000;

export const OptionsProvider = ({ children }: { children: React.ReactNode }) => {
  const isFetchingRef = useRef(false);
  const optionsVersionRef = useRef<string | null>(null);
  const [, forceRender] = useState(0);

  const fetchAndApplyOptions = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const response = await fetchPublicOptions();
      const { payload, version: responseVersion } = parseOptionsResponse(response);
      if (!payload) return;

      applyDynamicOptions(payload);

      const version = responseVersion || optionsVersionRef.current || undefined;
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
