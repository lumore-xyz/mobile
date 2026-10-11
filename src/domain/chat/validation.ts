import { z } from "zod/mini";

export const chatFeedbackSchema = z.string().check(
  z.trim(),
  z.maxLength(500, "Feedback must be at most 500 characters."),
);

export const chatReportSchema = z.object({
  category: z.string().check(
    z.trim(),
    z.minLength(1, "Please choose a report category."),
  ),
  details: z.string().check(
    z.trim(),
    z.minLength(5, "Please describe the issue before reporting."),
    z.maxLength(1000, "Report details must be at most 1000 characters."),
  ),
});

export const messageSchema = z.optional(
  z.string().check(z.trim(), z.maxLength(1000, "Message is too long.")),
);
