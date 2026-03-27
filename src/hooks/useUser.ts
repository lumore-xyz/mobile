import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef } from "react";
import apiClient from "../service/api-client";
import { clearSession, getUser } from "../service/storage";

const fetchUser = async (userId: string) => {
  const { data } = await apiClient.get(`/profile/${userId}`);

  return data;
};

const updateUserField = async ({
  userId,
  field,
  value,
}: {
  userId: string;
  field: string;
  value: any;
}) => {
  const response = await apiClient.patch(`/profile/${userId}`, {
    [field]: value,
  });
  return response.data;
};

const updateFieldVisibility = async ({
  userId,
  field,
  visibility,
}: {
  userId: string;
  field: string;
  visibility: string;
}) => {
  const response = await apiClient.patch(`/profile/${userId}/visibility`, {
    fields: { [field]: visibility },
  });
  return response.data;
};

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
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  useEffect(() => {
    if (hasForcedLogoutRef.current) return;
    if (!error) return;
    if (!userId || !currentUserId || userId !== currentUserId) return;

    const status = (error as any)?.response?.status;
    const shouldForceLogout = status === 401 || status === 403 || status === 404;
    if (!shouldForceLogout) return;

    hasForcedLogoutRef.current = true;
    clearSession();
    router.replace("/login");
  }, [currentUserId, error, router, userId]);

  const updateFieldMutation = useMutation({
    mutationFn: ({ field, value }: { field: string; value: any }) =>
      updateUserField({ userId, field, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });

  const updateVisibilityMutation = useMutation({
    mutationFn: ({
      field,
      visibility,
    }: {
      field: string;
      visibility: string;
    }) => updateFieldVisibility({ userId, field, visibility }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
  });

  return {
    user,
    isLoading,
    error,
    updateField: updateFieldMutation.mutate,
    updateVisibility: updateVisibilityMutation.mutate,
    isUpdating:
      updateFieldMutation.isPending || updateVisibilityMutation.isPending,
  };
};
