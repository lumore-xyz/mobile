import apiClient from "../../service/api-client";
import {
  NOTIFICATION_PAGINATION,
  type NotificationListResponse,
} from "./constants";

export interface FetchNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const fetchNotifications = async (
  params: FetchNotificationsParams = {},
) => {
  const search = new URLSearchParams();
  const page = Math.max(Number(params.page) || NOTIFICATION_PAGINATION.DEFAULT_PAGE, 1);
  const limit = Math.min(
    Math.max(Number(params.limit) || NOTIFICATION_PAGINATION.DEFAULT_LIMIT, 1),
    NOTIFICATION_PAGINATION.MAX_LIMIT,
  );
  search.set("page", String(page));
  search.set("limit", String(limit));
  if (params.unreadOnly) search.set("unreadOnly", "true");

  const response = await apiClient.get<NotificationListResponse>(
    `/notifications?${search.toString()}`,
  );
  return response.data;
};

export const fetchUnreadNotificationCount = async () => {
  const response = await apiClient.get<{ success: boolean; unreadCount: number }>(
    "/notifications/unread-count",
  );
  return response.data.unreadCount;
};

export const markNotificationAsRead = async (notificationId: string) => {
  const response = await apiClient.patch<{ success: boolean; data: any }>(
    `/notifications/${notificationId}/read`,
  );
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.post<{
    success: boolean;
    modifiedCount: number;
  }>(`/notifications/read-all`);
  return response.data;
};

export const deleteNotification = async (notificationId: string) => {
  const response = await apiClient.delete<{ success: boolean; deleted: boolean }>(
    `/notifications/${notificationId}`,
  );
  return response.data;
};

export const ADMIN_ENDPOINTS = {
  SYSTEM_NOTIFICATION: "/admin/notifications/system",
  SYSTEM_NOTIFICATION_BULK: "/admin/notifications/system/bulk",
};

export default {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};
