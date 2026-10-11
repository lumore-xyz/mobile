import { useIsFocused } from "@react-navigation/native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { AppState } from "react-native";

import { getUser } from "@/src/service/storage";
import { fetchDailyExplore } from "./api";
import { exploreQueryKeys } from "./queryKeys";
import isExploreExpired from "./isExploreExpired";

export default function useDailyExploreQuery(userId: string) {
  const focused = useIsFocused();
  const [active, setActive] = useState(AppState.currentState === "active");
  const [clock, setClock] = useState(Date.now);
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => exploreQueryKeys.daily(userId), [userId]);
  const enabled = Boolean(userId) && focused && active;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setActive(state === "active"),
    );
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (focused && active) setClock(Date.now());
  }, [focused, active]);

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const result = await fetchDailyExplore(signal);
      if (String(getUser()?._id || "") !== userId) {
        throw new Error("Session changed");
      }
      return result;
    },
    enabled,
    staleTime: 0,
    retry: false,
    refetchIntervalInBackground: false,
    refetchInterval: (state) =>
      enabled && !state.state.error && state.state.data?.status === "generating"
        ? state.state.data.retryAfterMs
        : false,
  });

  const resetAt = query.data?.resetAt;
  useEffect(() => {
    if (!enabled || !resetAt || !Number.isFinite(Date.parse(resetAt))) return;
    const timer = setTimeout(
      () => {
        setClock(Date.now());
        void queryClient.invalidateQueries({ queryKey });
      },
      Math.max(0, Date.parse(resetAt) - Date.now()) + 100,
    );
    return () => clearTimeout(timer);
  }, [enabled, resetAt, queryClient, queryKey]);

  const data = isExploreExpired(resetAt, Math.max(clock, Date.now()))
    ? undefined
    : query.data;

  return { query, queryKey, data, enabled };
}
