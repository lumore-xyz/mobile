import { z } from "zod/mini";
import getAgeFromDate from "@/src/utils/helpers/getAgeFromDate";
import type { Field, Screen } from "./types";

export default function validateScreen(
  screen: Screen,
  values: Record<string, unknown>,
) {
  const errors: Record<string, string> = {};

  const getFieldSchema = (field: Field) => {
    const isRequired = field.required !== false;
    const requiredMessage = field.errorText || "This field is required.";

    if (field.type === "text") {
      if (field.name === "referralCode") {
        return z.pipe(
          z.transform((raw: unknown) =>
            typeof raw === "string" ? raw.trim() : "",
          ),
          z.string().check(
            z.refine(
              (value) => value === "" || /^[a-zA-Z0-9_]{3,30}$/.test(value),
              field.errorText ||
                "Referral code can only contain letters, numbers, and underscores.",
            ),
          ),
        );
      }

      let schema = z.string().check(z.trim());
      if (isRequired) schema = schema.check(z.minLength(1, requiredMessage));
      return schema;
    }

    if (field.type === "number") {
      if (field.name === "phoneNumber") {
        let schema = z.string();
        if (isRequired) schema = schema.check(z.minLength(1, requiredMessage));
        return z.pipe(
          z.pipe(
            schema,
            z.transform((value) => value.replace(/\s+/g, "")),
          ),
          z.string().check(
            z.refine((value) => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
              error: field.errorText || "Please enter a valid phone number.",
            }),
          ),
        );
      }
      return z.number();
    }

    if (field.type === "email") {
      let schema = z.string().check(z.trim());
      if (isRequired) schema = schema.check(z.minLength(1, requiredMessage));
      return schema.check(
        z.refine(
          (value) => !value || z.email().safeParse(value).success,
          field.errorText || "Please enter a valid email address.",
        ),
      );
    }

    if (field.type === "date") {
      let schema = z.string().check(z.minLength(1, requiredMessage));
      if (!isRequired) schema = z.string();

      return schema.check(
        z.refine(
          (value) => value === "" || !Number.isNaN(new Date(value).getTime()),
          field.errorText || "Please enter a valid date.",
        ),
        z.refine(
          (value) => {
            if (!value) return !isRequired;
            const age = getAgeFromDate(value);
            return field.min === undefined || age >= field.min;
          },
          field.errorText || `You must be at least ${field.min} years old.`,
        ),
        z.refine(
          (value) => {
            if (!value) return !isRequired;
            const age = getAgeFromDate(value);
            return field.max === undefined || age <= field.max;
          },
          field.errorText || `Age must be ${field.max} years or below.`,
        ),
      );
    }

    if (field.type === "select") {
      let schema = z.string();
      if (isRequired) schema = schema.check(z.minLength(1, requiredMessage));
      return schema.check(
        z.refine(
          (value) =>
            !value ||
            !field.options?.length ||
            field.options.some((option) => option.value === value),
          field.errorText || "Please select a valid option.",
        ),
      );
    }

    if (field.type === "multiselect") {
      let schema = z.array(z.string());
      if (isRequired) schema = schema.check(z.minLength(1, requiredMessage));
      return schema.check(
        z.refine(
          (selectedValues) =>
            !field.options?.length ||
            selectedValues.every((value) =>
              field.options?.some((option) => option.value === value),
            ),
          field.errorText || "Please select valid options.",
        ),
      );
    }

    if (field.type === "range") {
      return z.array(z.number()).check(z.length(2));
    }

    if (field.type === "slider") {
      return z.number();
    }

    return z.unknown();
  };

  screen.fields.forEach((field) => {
    const value = values[field.name];
    const result = getFieldSchema(field).safeParse(value);
    if (!result.success) {
      errors[field.name] = result.error.issues[0]?.message || "Invalid value.";
    }
  });

  return errors;
}
