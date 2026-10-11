import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import {
  fetchUser,
  updateFieldVisibility,
  updateUserField,
} from "@/src/features/profile/api";
import { clearSession, getUser } from "../service/storage";
import getHttpErrorStatus from "../utils/getHttpErrorStatus";
import { profileQueryKeys } from "@/src/features/profile/queryKeys";
import invalidateUserProfileQueries from "@/src/features/profile/invalidateUserProfileQueries";

export const useUser = (userId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const hasForcedLogoutRef = useRef(false);
  const currentUserId = useMemo(() => {
    try {
      return getUser()?._id || "";
    } catch {
      return "";
    }
  }, []);

  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: profileQueryKeys.user(userId),
    queryFn: () => fetchUser(userId),
    enabled: Boolean(userId),
  });

  useEffect(() => {
    if (hasForcedLogoutRef.current) return;
    if (!error) return;
    if (!userId || !currentUserId || userId !== currentUserId) return;

    const status = getHttpErrorStatus(error);
    const shouldForceLogout =
      status === 401 || status === 403 || status === 404;
    if (!shouldForceLogout) return;

    hasForcedLogoutRef.current = true;
    clearSession();
    router.replace("/login");
  }, [currentUserId, error, router, userId]);

  const refreshUserData = () => invalidateUserProfileQueries(queryClient, userId);

  const updateFieldMutation = useMutation({
    mutationFn: ({ field, value }: { field: string; value: unknown }) =>
      updateUserField({ userId, field, value }),
    onSuccess: refreshUserData,
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: ({
      field,
      visibility,
    }: {
      field: string;
      visibility: string;
    }) => updateFieldVisibility({ userId, field, visibility }),
    onSuccess: refreshUserData,
  });

  return {
    user,
    isLoading,
    error,
    updateField: updateFieldMutation.mutateAsync,
    updateVisibility: updateVisibilityMutation.mutateAsync,
    isUpdating:
      updateFieldMutation.isPending || updateVisibilityMutation.isPending,
  };
};
