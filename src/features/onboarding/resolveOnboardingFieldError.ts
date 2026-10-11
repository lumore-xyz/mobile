import type { Screen } from "@/src/features/onboarding/types";
import { isAxiosError } from "axios";

const DUPLICATE_FIELD_MESSAGES: Record<string, string> = {
  phoneNumber: "This phone number is already in use. Please use another.",
  email: "This email is already in use. Please use another.",
  username: "This username is already in use. Please use another.",
};

const extractApiMessage = (error: unknown) => {
  const responseMessage = isAxiosError<{ message?: unknown }>(error)
    ? error.response?.data?.message
    : undefined;
  if (typeof responseMessage === "string") return responseMessage;
  if (error instanceof Error) return error.message;
  return "Unable to save this step right now. Please try again.";
};

const extractDuplicateField = (message: string) => {
  const indexMatch = message.match(/index:\s*([A-Za-z0-9._$-]+)_1/i);
  if (indexMatch?.[1]) {
    const indexField = indexMatch[1].split(".").pop();
    if (indexField) return indexField;
  }

  const duplicateKeyMatch = message.match(
    /dup key:\s*\{\s*"?([A-Za-z0-9._$-]+)"?\s*:/i,
  );
  if (duplicateKeyMatch?.[1]) {
    return duplicateKeyMatch[1].split(".").pop() || duplicateKeyMatch[1];
  }

  return null;
};

const resolveOnboardingFieldError = (error: unknown, screen: Screen) => {
  const message = extractApiMessage(error);
  const normalized = message.toLowerCase();
  const hasDuplicateSignature =
    normalized.includes("e11000") || normalized.includes("duplicate key");

  if (hasDuplicateSignature) {
    const duplicateField = extractDuplicateField(message);

    if (
      duplicateField &&
      screen.fields.some((field) => field.name === duplicateField)
    ) {
      return {
        fieldName: duplicateField,
        message:
          DUPLICATE_FIELD_MESSAGES[duplicateField] ||
          "This value already exists. Please use a different one.",
      };
    }

    if (normalized.includes("phone") || normalized.includes("phonenumber")) {
      if (screen.fields.some((field) => field.name === "phoneNumber")) {
        return {
          fieldName: "phoneNumber",
          message: DUPLICATE_FIELD_MESSAGES.phoneNumber,
        };
      }
    }

    if (normalized.includes("email")) {
      if (screen.fields.some((field) => field.name === "email")) {
        return {
          fieldName: "email",
          message: DUPLICATE_FIELD_MESSAGES.email,
        };
      }
    }
  }

  if (
    normalized.includes("referral") &&
    screen.fields.some((field) => field.name === "referralCode")
  ) {
    return {
      fieldName: "referralCode",
      message,
    };
  }

  return null;
};

export default resolveOnboardingFieldError;
