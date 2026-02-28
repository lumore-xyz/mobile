import * as z from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required.")
  .email("Please enter a valid email address.");

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required.")
  .transform((value) => value.replace(/\s+/g, ""))
  .refine((value) => /^\+?[1-9]\d{1,14}$/.test(value), {
    message: "Please enter a valid international phone number.",
  });

export const walletSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address format.");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(25, "Password must be at most 25 characters.")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$#!%*?&]+$/,
    "Password must include uppercase, lowercase, number, and special character.",
  );
