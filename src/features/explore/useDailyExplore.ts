import { getUser } from "@/src/service/storage";
import useDailyExploreActions from "./useDailyExploreActions";
import useDailyExploreQuery from "./useDailyExploreQuery";

export const useDailyExplore = () => {
  const userId = String(getUser()?._id || "");
  const { query, queryKey, data, enabled } = useDailyExploreQuery(userId);
  const actions = useDailyExploreActions(userId, queryKey, query.refetch);

  return {
    userId,
    data,
    enabled,
    isLoading:
      Boolean(userId) && (query.isPending || (!data && query.isFetching)),
    isRefreshing: query.isFetching && !query.isPending,
    isUnlocking: actions.isUnlocking,
    isRefreshingList: actions.isRefreshingList,
    openingProfileId: actions.openingProfileId,
    rejectingProfileId: actions.rejectingProfileId,
    // Keep showing a usable cached list without surfacing a stale refetch error
    // over the cards. Errors remain visible for locked/loading/error states.
    error: data?.status === "ready" ? null : query.error || actions.unlockError,
    refresh: query.refetch,
    unlockToday: actions.unlockToday,
    refreshToday: actions.refreshToday,
    sayHello: actions.sayHello,
    rejectProfile: actions.rejectProfile,
  };
};
