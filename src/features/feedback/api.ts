import type PaginatedResponse from "@/src/domain/api/PaginatedResponse";
import apiClient from "@/src/service/api-client";
import type { FeedbackItem } from "@/src/utils/types";

export const fetchReceivedFeedbacksPage = async (
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<FeedbackItem>> => {
  const response = await apiClient.get<PaginatedResponse<FeedbackItem>>(
    "/inbox/feedback/received",
    { params: { page, limit } },
  );
  return response.data;
};
