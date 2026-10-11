import { z } from "zod/mini";

export const emailSchema = z.pipe(
  z.string().check(z.trim(), z.minLength(1, "Email is required.")),
  z.email("Please enter a valid email address."),
);

export const phoneSchema = z.pipe(
  z.pipe(
    z.string().check(z.trim(), z.minLength(1, "Phone number is required.")),
    z.transform((value: string) => value.replace(/\s+/g, "")),
  ),
  z.string().check(
    z.refine((value) => /^\+?[1-9]\d{1,14}$/.test(value), {
      error: "Please enter a valid international phone number.",
    }),
  ),
);

export const walletSchema = z.string().check(
  z.trim(),
  z.regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address format."),
);

export const passwordSchema = z.string().check(
  z.minLength(8, "Password must be at least 8 characters."),
  z.maxLength(25, "Password must be at most 25 characters."),
  z.regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$#!%*?&]+$/,
    "Password must include uppercase, lowercase, number, and special character.",
  ),
);
