import * as z from "zod";

export const chatFeedbackSchema = z
  .string()
  .trim()
  .min(3, "Please add feedback before ending the chat.")
  .max(500, "Feedback must be at most 500 characters.");

export const chatReportSchema = z.object({
  category: z.string().trim().min(1, "Please choose a report category."),
  details: z
    .string()
    .trim()
    .min(5, "Please describe the issue before reporting.")
    .max(1000, "Report details must be at most 1000 characters."),
});

export const messageSchema = z
  .string()
  .trim()
  .max(1000, "Message is too long.")
  .optional();
