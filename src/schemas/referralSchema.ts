import * as z from "zod";

export const referralCodeSchema = z
  .string()
  .trim()
  .min(3, "Referral code must be at least 3 characters")
  .max(30, "Referral code must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_.-]+$/, "Referral code can only contain letters and numbers");

export type ReferralCodeInput = z.infer<typeof referralCodeSchema>;
