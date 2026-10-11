import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useRef } from "react";

import { inboxQueryKeys } from "@/src/features/chat/inboxQueryKeys";
import { creditsQueryKeys } from "@/src/features/credits/queryKeys";
import { profileQueryKeys } from "@/src/features/profile/queryKeys";
import { useAd } from "@/src/hooks/useAd";
import { getUser } from "@/src/service/storage";
import showErrorAlert from "@/src/utils/showErrorAlert";
import {
  DailyExplore,
  forceRefreshDailyExplore,
  rejectExploreProfile,
  RejectExploreProfileInput,
  startExploreConversation,
  unlockDailyExplore,
} from "./api";
import { exploreQueryKeys } from "./queryKeys";

export default function useDailyExploreActions(
  userId: string,
  queryKey: ReturnType<typeof exploreQueryKeys.daily>,
  refetch: () => unknown,
) {
  const { showRewarded } = useAd();
  const queryClient = useQueryClient();
  const unlockBusy = useRef(false);
  const chatBusy = useRef(false);

  const invalidateCredits = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: creditsQueryKeys.all });
    void queryClient.invalidateQueries({
      queryKey: profileQueryKeys.user(userId),
    });
  }, [queryClient, userId]);

  const unlockMutation = useMutation({
    mutationFn: async () => ({ result: await unlockDailyExplore(), ownerId: userId }),
    retry: false,
    onSuccess: ({ result, ownerId }) =>
      queryClient.setQueryData(exploreQueryKeys.daily(ownerId), result),
    // A timed-out POST may already have paid: recover through GET, never an automatic POST retry.
    onError: () => void refetch(),
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
      void queryClient.invalidateQueries({ queryKey: inboxQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey });
      router.push({ pathname: "/chat/[roomId]", params: { roomId } });
    },
    onError: (error) => {
      showErrorAlert("Could not open this conversation", error);
      void refetch();
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async (requestId: string) => ({
      result: await forceRefreshDailyExplore(requestId),
      ownerId: userId,
    }),
    retry: false,
    onSuccess: ({ result, ownerId }) => {
      queryClient.setQueryData(exploreQueryKeys.daily(ownerId), result);
    },
    onError: (error) => {
      showErrorAlert("Could not refresh Explore", error);
      void refetch();
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
      showErrorAlert("Could not remove this suggestion", error);
      void refetch();
    },
  });

  const { mutate: unlock } = unlockMutation;
  const { mutate: startChat } = conversation;
  const {
    mutate: forceRefresh,
    isPending: isRefreshingList,
  } = refreshMutation;
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
    if (isRefreshingList) return;
    forceRefresh(`${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  }, [forceRefresh, isRefreshingList]);

  return {
    isUnlocking: unlockMutation.isPending,
    isRefreshingList,
    openingProfileId: conversation.isPending ? conversation.variables : undefined,
    rejectingProfileId: rejection.isPending
      ? rejection.variables?.profileId
      : undefined,
    unlockError: unlockMutation.error,
    unlockToday,
    refreshToday,
    sayHello,
    rejectProfile,
  };
}
