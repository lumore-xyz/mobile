import { z } from "zod/mini";

export const referralCodeSchema = z.string().check(
  z.trim(),
  z.minLength(3, "Referral code must be at least 3 characters"),
  z.maxLength(30, "Referral code must be at most 30 characters"),
  z.regex(/^[a-zA-Z0-9_.-]+$/, "Referral code can only contain letters and numbers"),
);
