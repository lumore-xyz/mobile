import type { DynamicOptionsPayload } from "@/src/libs/options";
import isRecord from "@/src/utils/isRecord";

interface ParsedOptionsResponse {
  payload: DynamicOptionsPayload | null;
  version: string | null;
}

export default function parseOptionsResponse(
  response: unknown,
): ParsedOptionsResponse {
  const responseData = isRecord(response) ? response : {};
  const data = isRecord(responseData.data) ? responseData.data : {};

  const container = data.options ?? responseData.options ?? responseData.data;
  let payload: DynamicOptionsPayload | null = null;

  if (isRecord(container)) {
    payload = {};
    Object.entries(container).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        (payload as Record<string, unknown>)[key] = value;
      }
    });
  }

  const version =
    data.version ??
    responseData.version ??
    data.optionsVersion ??
    responseData.optionsVersion ??
    data.updatedAt ??
    responseData.updatedAt;

  return {
    payload,
    version: typeof version === "string" && version.trim() ? version : null,
  };
}
