import { referralCodeSchema } from "@/src/schemas/referralSchema";
import config from "@/src/service/config";
import { Platform } from "react-native";

const DEFAULT_PLAYSTORE_URL =
  "https://play.google.com/store/apps/details?id=xyz.lumore.rebel";

const normalizeReferralCode = (rawCode: unknown): string | null => {
  if (typeof rawCode !== "string") return null;
  const parsed = referralCodeSchema.safeParse(rawCode);
  if (!parsed.success) return null;
  return parsed.data;
};

const appendQueryParams = (
  baseUrl: string,
  params: Record<string, string>,
): string => {
  try {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  } catch {
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}${new URLSearchParams(params).toString()}`;
  }
};

const parseCodeFromSearchParams = (searchParams: URLSearchParams) => {
  const code = searchParams.get("code") || searchParams.get("referral_code");
  return normalizeReferralCode(code);
};

export const extractReferralCodeFromInstallReferrer = (
  referrer: string | null | undefined,
) => {
  if (!referrer) return null;
  const candidates = [referrer];

  try {
    const decoded = decodeURIComponent(referrer);
    if (decoded !== referrer) candidates.push(decoded);
  } catch {
    // ignore decode errors and continue with the raw referrer value
  }

  for (const candidateRaw of candidates) {
    const candidate = candidateRaw.trim();
    if (!candidate) continue;

    try {
      const params = new URLSearchParams(
        candidate.startsWith("?") ? candidate.slice(1) : candidate,
      );
      const codeFromParams = parseCodeFromSearchParams(params);
      if (codeFromParams) return codeFromParams;
    } catch {
      // ignore malformed query strings and try the next parsing strategy
    }

    try {
      const asUrl = new URL(candidate);
      const codeFromUrl = parseCodeFromSearchParams(asUrl.searchParams);
      if (codeFromUrl) return codeFromUrl;
    } catch {
      // ignore malformed URLs and continue
    }
  }

  return null;
};

export const extractReferralCodeFromUrl = (url: string | null | undefined) => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const codeFromQuery = parseCodeFromSearchParams(parsedUrl.searchParams);
    if (codeFromQuery) return codeFromQuery;

    const nestedReferrer = parsedUrl.searchParams.get("referrer");
    const codeFromNestedReferrer =
      extractReferralCodeFromInstallReferrer(nestedReferrer);
    if (codeFromNestedReferrer) return codeFromNestedReferrer;
  } catch {
    // ignore malformed URLs and try regex fallback
  }

  const match = url.match(/[?&](?:code|referral_code)=([^&#]+)/i);
  if (!match?.[1]) return null;
  try {
    return normalizeReferralCode(decodeURIComponent(match[1]));
  } catch {
    return normalizeReferralCode(match[1]);
  }
};

export const buildReferralShareLink = (
  referralCode: string,
  platform: "android" | "ios" = Platform.OS === "ios" ? "ios" : "android",
) => {
  const code = normalizeReferralCode(referralCode);
  if (!code) return null;

  if (platform === "ios") {
    const iosStoreUrl = config.APPSTORE_URL || config.PLAYSTORE_URL;
    if (!iosStoreUrl) return null;
    return appendQueryParams(iosStoreUrl, { ct: `referral_${code}` });
  }

  const playstoreUrl = config.PLAYSTORE_URL || DEFAULT_PLAYSTORE_URL;
  return appendQueryParams(playstoreUrl, {
    referrer: `utm_source=lumore_referral&referral_code=${code}`,
  });
};
