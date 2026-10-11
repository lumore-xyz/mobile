import MobileNav from "@/src/components/MobileNav";
import ActiveFilterChip from "@/src/components/ui/ActiveFilterChip";
import CommunityDirectoryChip from "@/src/components/community/CommunityDirectoryChip";
import CommunityDirectorySkeleton from "@/src/components/community/CommunityDirectorySkeleton";
import CommunityFilterSheet, { COMMUNITY_SORT_OPTIONS, type CommunityFilters } from "@/src/components/community/CommunityFilterSheet";
import CommunityHero from "@/src/components/community/CommunityHero";
import EmptyRoomsState from "@/src/components/community/EmptyRoomsState";
import LumoreRefreshControl from "@/src/components/ui/LumoreRefreshControl";
import RoomCard from "@/src/components/community/RoomCard";
import RoomsErrorState from "@/src/components/community/RoomsErrorState";
import { EXPLORE_SOCKET_EVENTS } from "@/src/domain/chat/socketEvents";
import { fetchNearbyRooms } from "@/src/features/community/api";
import invalidateCommunityQueries from "@/src/features/community/invalidateCommunityQueries";
import { communityQueryKeys } from "@/src/features/community/queryKeys";
import { inboxQueryKeys } from "@/src/features/chat/inboxQueryKeys";
import type { CommunityRoomSort, CommunityRoomTypeFilter, LocationRoomSummary } from "@/src/features/community/types";
import { useSocket } from "@/src/service/context/SocketContext";
import useLocation from "@/src/hooks/useLocation";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RoomsScreen() {
  const { latitude, longitude, error: locationError } = useLocation();
  const { socket, revalidateSocket } = useSocket();
  const queryClient = useQueryClient();
  const createCommunity = useCallback(() => {
    triggerSelectionHaptic();
    router.push("/community/create");
  }, []);

  const [searchText, setSearchText] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CommunityRoomTypeFilter>("all");
  const [nearbyOnly, setNearbyOnly] = useState(false);
  const [sort, setSort] = useState<CommunityRoomSort>("pool_high");
  const [joinedOnly, setJoinedOnly] = useState(false);
  const [inPoolOnly, setInPoolOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDraft, setFilterDraft] = useState<CommunityFilters>({
    type: "all",
    nearby: false,
    sort: "pool_high",
    joinedOnly: false,
    inPoolOnly: false,
  });
  const hasCurrentLocation = Number.isFinite(latitude) && Number.isFinite(longitude);

  useEffect(() => {
    if (hasCurrentLocation) return;
    setNearbyOnly(false);
    if (sort === "nearest") setSort("pool_high");
  }, [hasCurrentLocation, sort]);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 450);
    return () => clearTimeout(timer);
  }, [searchText]);

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: communityQueryKeys.directory({
      search,
      type: typeFilter,
      nearby: nearbyOnly,
      sort,
      latitude,
      longitude,
      joinedOnly,
      inPoolOnly,
    }),
    queryFn: ({ pageParam }) => fetchNearbyRooms({
      latitude,
      longitude,
      radiusKm: 25,
      page: pageParam,
      search,
      type: typeFilter,
      nearby: nearbyOnly,
      sort,
      joinedOnly,
      inPoolOnly,
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.page + 1 : undefined,
  });
  const rooms = data?.pages.flatMap((page) => page.rooms) || [];
  const roomCount = data?.pages[0]?.totalCount || 0;

  useEffect(() => {
    revalidateSocket();
  }, [revalidateSocket]);

  useEffect(() => {
    if (!socket) return;
    const invalidateRooms = () => {
      invalidateCommunityQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: inboxQueryKeys.active });
    };
    socket.on(EXPLORE_SOCKET_EVENTS.roomPoolUpdated, invalidateRooms);
    socket.on(EXPLORE_SOCKET_EVENTS.roomMatchFound, invalidateRooms);
    return () => {
      socket.off(EXPLORE_SOCKET_EVENTS.roomPoolUpdated, invalidateRooms);
      socket.off(EXPLORE_SOCKET_EVENTS.roomMatchFound, invalidateRooms);
    };
  }, [queryClient, socket]);

  const renderItem = useCallback<ListRenderItem<LocationRoomSummary>>(
    ({ item }) => <RoomCard room={item} />,
    [],
  );

  return (
    <>
      <View className="flex-1 bg-ui-surface-page px-4 pt-6">
        <FlatList
          data={rooms}
          keyExtractor={(room) => room._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={(
            <View>
              <CommunityHero roomCount={roomCount} onCreate={createCommunity} />
              {locationError ? (
                <View className="mb-4 flex-row items-start gap-3 rounded-[24px] border border-ui-parchment bg-ui-champagne/20 p-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-paper">
                    <Icon name="MapPinOff" size={18} color={COLORS.ink} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-bold text-ui-ink">Location unavailable</Text>
                    <Text className="mt-1 text-sm leading-5 text-ui-slate">You can still browse every community. Turn on location to use nearby filters.</Text>
                  </View>
                </View>
              ) : null}
              <View className="mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="h-12 flex-1 flex-row items-center rounded-full border border-ui-parchment bg-ui-paper px-4">
                    <Icon name="Search" size={18} color={COLORS.slate} />
                    <TextInput
                      value={searchText}
                      onChangeText={setSearchText}
                      placeholder="Search communities"
                      placeholderTextColor={COLORS.slate}
                      className="ml-2 flex-1 text-sm text-ui-ink"
                      returnKeyType="search"
                      accessibilityLabel="Search communities by name, topic, or tag"
                    />
                    {searchText ? (
                      <Pressable
                        onPress={() => {
                          setSearchText("");
                          setSearch("");
                        }}
                        className="h-8 w-8 items-center justify-center rounded-full"
                        accessibilityRole="button"
                        accessibilityLabel="Clear community search"
                      >
                        <Icon name="X" size={16} color={COLORS.slate} />
                      </Pressable>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => {
                      setFilterDraft({ type: typeFilter, nearby: nearbyOnly, sort, joinedOnly, inPoolOnly });
                      setIsFilterOpen(true);
                    }}
                    className="h-12 w-12 items-center justify-center rounded-full border border-ui-parchment bg-ui-paper active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel="Filter and sort communities"
                  >
                    <Icon name="SlidersHorizontal" size={19} color={COLORS.forest} />
                    {typeFilter !== "all" || nearbyOnly || sort !== "pool_high" || joinedOnly || inPoolOnly ? (
                      <View className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border border-ui-paper bg-ui-champagne" />
                    ) : null}
                  </Pressable>
                </View>
                <View className="mt-2 flex-row flex-wrap gap-2">
                  <CommunityDirectoryChip label="Joined" selected={joinedOnly} onPress={() => setJoinedOnly((value) => !value)} />
                  <CommunityDirectoryChip label="In pool" selected={inPoolOnly} onPress={() => setInPoolOnly((value) => !value)} />
                </View>
                {typeFilter !== "all" || nearbyOnly || sort !== "pool_high" || joinedOnly || inPoolOnly ? (
                  <View className="mt-2 flex-row flex-wrap gap-2">
                    {typeFilter !== "all" ? <ActiveFilterChip label={typeFilter === "local" ? "Local" : "Topic"} /> : null}
                    {nearbyOnly ? <ActiveFilterChip label="Nearby · 25 km" /> : null}
                    {sort !== "pool_high" ? <ActiveFilterChip label={COMMUNITY_SORT_OPTIONS.find((option) => option.value === sort)?.label || "Sorted"} /> : null}
                  </View>
                ) : null}
              </View>
              {isLoading ? <CommunityDirectorySkeleton /> : error ? <RoomsErrorState onRetry={() => void refetch()} /> : null}
            </View>
          )}
          ListEmptyComponent={!isLoading && !error ? <EmptyRoomsState search={search} onCreate={createCommunity} /> : null}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} color={COLORS.forest} /> : null}
          refreshControl={
            <LumoreRefreshControl
              refreshing={isRefetching}
              onRefresh={() => { void refetch(); }}
            />
          }
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews={Platform.OS === "android"}
        />
      </View>
      <CommunityFilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        draft={filterDraft}
        setDraft={setFilterDraft}
        hasCurrentLocation={hasCurrentLocation}
        onApply={() => {
          const next = { ...filterDraft };
          if (next.type === "topic") {
            next.nearby = false;
            if (next.sort === "nearest") next.sort = "pool_high";
          }
          setTypeFilter(next.type);
          setNearbyOnly(next.nearby);
          setSort(next.sort);
          setJoinedOnly(next.joinedOnly);
          setInPoolOnly(next.inPoolOnly);
          setIsFilterOpen(false);
        }}
        onReset={() => setFilterDraft({ type: "all", nearby: false, sort: "pool_high", joinedOnly: false, inPoolOnly: false })}
      />
      <MobileNav />
    </>
  );
}
