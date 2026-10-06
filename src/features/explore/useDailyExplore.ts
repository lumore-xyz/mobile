import { useIsFocused } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AppState } from "react-native";
import { useAd } from "@/src/hooks/useAd";
import { getUser } from "@/src/service/storage";
import { toUserFacingError } from "@/src/utils/userFacingError";
import {
  DailyExplore,
  fetchDailyExplore,
  forceRefreshDailyExplore,
  rejectExploreProfile,
  RejectExploreProfileInput,
  startExploreConversation,
  unlockDailyExplore,
} from "./api";
import { isExploreExpired } from "./state";

export const useDailyExplore = () => {
  const { showRewarded } = useAd();
  const focused = useIsFocused();
  const [active, setActive] = useState(AppState.currentState === "active");
  const userId = String(getUser()?._id || "");
  const [clock, setClock] = useState(Date.now);
  const unlockBusy = useRef(false);
  const chatBusy = useRef(false);
  const queryClient = useQueryClient();
  const queryKey = ["explore", "daily", userId] as const;
  const enabled = Boolean(userId) && focused && active;

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) =>
      setActive(state === "active"),
    );
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (focused && active) {
      setClock(Date.now());
    }
  }, [focused, active]);

  const query = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const result = await fetchDailyExplore(signal);
      if (String(getUser()?._id || "") !== userId)
        throw new Error("Session changed");
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
        void queryClient.invalidateQueries({
          queryKey: ["explore", "daily", userId],
        });
      },
      Math.max(0, Date.parse(resetAt) - Date.now()) + 100,
    );
    return () => clearTimeout(timer);
  }, [enabled, resetAt, queryClient, userId]);

  const invalidateCredits = () => {
    void queryClient.invalidateQueries({ queryKey: ["credits"] });
    void queryClient.invalidateQueries({ queryKey: ["user", userId] });
  };
  const unlockMutation = useMutation({
    mutationFn: async () => ({
      result: await unlockDailyExplore(),
      ownerId: userId,
    }),
    retry: false,
    onSuccess: ({ result, ownerId }) =>
      queryClient.setQueryData(["explore", "daily", ownerId], result),
    // A timed-out POST may already have paid: recover through GET, never an automatic POST retry.
    onError: () => {
      void query.refetch();
    },
    onSettled: invalidateCredits,
  });
  const conversation = useMutation({
    mutationFn: async (profileId: string) => ({
      ...(await startExploreConversation(profileId)),
      ownerId: userId,
    }),
    retry: false,
    onSuccess: ({ roomId, ownerId }) => {
      if (String(getUser()?._id || "") !== ownerId) return;
      void queryClient.invalidateQueries({ queryKey: ["inbox"] });
      void queryClient.invalidateQueries({ queryKey });
      router.push({ pathname: "/chat/[roomId]", params: { roomId } });
    },
    onError: (error) => {
      Alert.alert(
        "Could not open this conversation",
        toUserFacingError(error, "Please try again in a moment."),
      );
      void query.refetch();
    },
  });
  const refreshMutation = useMutation({
    mutationFn: async (requestId: string) => ({
      result: await forceRefreshDailyExplore(requestId),
      ownerId: userId,
    }),
    retry: false,
    onSuccess: ({ result, ownerId }) => {
      queryClient.setQueryData(["explore", "daily", ownerId], result);
    },
    onError: (error) => {
      Alert.alert(
        "Could not refresh Explore",
        toUserFacingError(error, "Please try again in a moment."),
      );
      void query.refetch();
    },
    onSettled: invalidateCredits,
  });
  const rejection = useMutation({
    mutationFn: async ({
      profileId,
      input,
    }: {
      profileId: string;
      input: RejectExploreProfileInput;
    }) => ({
      ...(await rejectExploreProfile(profileId, input)),
      ownerId: userId,
    }),
    retry: false,
    onSuccess: ({ profileId, ownerId }) => {
      if (String(getUser()?._id || "") !== ownerId) return;
      queryClient.setQueryData<DailyExplore>(queryKey, (current) =>
        current
          ? {
              ...current,
              profiles: current.profiles.filter(
                (profile) => profile._id !== profileId,
              ),
            }
          : current,
      );
    },
    onError: (error) => {
      Alert.alert(
        "Could not remove this suggestion",
        toUserFacingError(error, "Please try again in a moment."),
      );
      void query.refetch();
    },
  });

  const { mutate: unlock } = unlockMutation;
  const { mutate: startChat } = conversation;
  const { mutate: forceRefresh } = refreshMutation;
  const { mutateAsync: rejectSuggestion } = rejection;
  const unlockToday = useCallback(async () => {
    if (unlockBusy.current) return;
    unlockBusy.current = true;
    try {
      await showRewarded();
      unlock(undefined, {
        onSettled: () => {
          unlockBusy.current = false;
        },
      });
    } catch {
      unlockBusy.current = false;
    }
  }, [showRewarded, unlock]);
  const sayHello = useCallback(
    async (profileId: string) => {
      if (chatBusy.current) return;
      chatBusy.current = true;
      try {
        await showRewarded();
        startChat(profileId, {
          onSettled: () => {
            chatBusy.current = false;
          },
        });
      } catch {
        chatBusy.current = false;
      }
    },
    [showRewarded, startChat],
  );
  const rejectProfile = useCallback(
    async (profileId: string, input: RejectExploreProfileInput) => {
      await rejectSuggestion({ profileId, input });
    },
    [rejectSuggestion],
  );
  const refreshToday = useCallback(() => {
    if (refreshMutation.isPending) return;
    forceRefresh(`${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  }, [forceRefresh, refreshMutation.isPending]);

  const data = isExploreExpired(
    query.data?.resetAt,
    Math.max(clock, Date.now()),
  )
    ? undefined
    : query.data;
  return {
    userId,
    data,
    enabled,
    isLoading:
      Boolean(userId) && (query.isPending || (!data && query.isFetching)),
    isRefreshing: query.isFetching && !query.isPending,
    isUnlocking: unlockMutation.isPending,
    isRefreshingList: refreshMutation.isPending,
    openingProfileId: conversation.isPending
      ? conversation.variables
      : undefined,
    rejectingProfileId: rejection.isPending
      ? rejection.variables?.profileId
      : undefined,
    // Keep showing a usable cached list without surfacing a stale refetch error
    // over the cards. Errors remain visible for locked/loading/error states.
    error: data?.status === "ready" ? null : query.error || unlockMutation.error,
    refresh: query.refetch,
    unlockToday,
    refreshToday,
    sayHello,
    rejectProfile,
  };
};
