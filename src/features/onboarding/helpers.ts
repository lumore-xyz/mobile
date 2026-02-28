import * as z from "zod";
import type { Field, Screen } from "./types";

const GOAL_FIELD_MAP: Record<string, "primary" | "secondary" | "tertiary"> = {
  "primary-goal": "primary",
  "secondary-goal": "secondary",
  "tertiary-goal": "tertiary",
};

export function getInitialValuesForScreen(
  screen: Screen,
  user: Record<string, any> | undefined,
  userPreference: Record<string, any> | undefined,
) {
  const initialValues: Record<string, unknown> = {};
  const today = new Date();
  const getDateFromAge = (age: number) =>
    new Date(today.getFullYear() - age, today.getMonth(), today.getDate());

  screen.fields.forEach((field) => {
    if (field.place === "user" && user) {
      initialValues[field.name] = user[field.name];
      return;
    }

    if (field.place === "prefrence" && userPreference) {
      if (GOAL_FIELD_MAP[field.name]) {
        initialValues[field.name] =
          userPreference?.goal?.[GOAL_FIELD_MAP[field.name]];
      } else {
        initialValues[field.name] = userPreference[field.name];
      }
    }

    if (initialValues[field.name] === undefined) {
      if (field.type === "date") {
        const age = field.min ?? 18;
        initialValues[field.name] = getDateFromAge(age).toISOString();
      }

      if (field.type === "range") {
        initialValues[field.name] =
          field.defaultValue ?? [field.min ?? 18, field.max ?? 50];
      }

      if (field.type === "slider") {
        initialValues[field.name] = field.defaultValue ?? field.min ?? 1;
      }
    }
  });

  return initialValues;
}

export function validateScreen(screen: Screen, values: Record<string, unknown>) {
  const errors: Record<string, string> = {};

  const getAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dob.getDate())
    ) {
      age -= 1;
    }
    return age;
  };

  const getFieldSchema = (field: Field) => {
    const isRequired = field.required !== false;
    const requiredMessage = field.errorText || "This field is required.";

    if (field.type === "text") {
      if (field.name === "referralCode") {
        return z.preprocess(
          (raw) => (typeof raw === "string" ? raw.trim() : ""),
          z
            .string()
            .refine(
              (value) => value === "" || /^[a-zA-Z0-9_]{3,30}$/.test(value),
              {
                message:
                  field.errorText ||
                  "Referral code can only contain letters, numbers, and underscores.",
              },
            ),
        );
      }

      let schema = z.string().trim();
      if (isRequired) schema = schema.min(1, requiredMessage);
      return schema;
    }

    if (field.type === "number") {
      if (field.name === "phoneNumber") {
        let schema = z.string();
        if (isRequired) schema = schema.min(1, requiredMessage);
        return schema
          .transform((value) => value.replace(/\s+/g, ""))
          .refine((value) => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
            message: field.errorText || "Please enter a valid phone number.",
          });
      }
      return z.number();
    }

    if (field.type === "email") {
      let schema = z.string().trim();
      if (isRequired) schema = schema.min(1, requiredMessage);
      return schema.refine(
        (value) => !value || z.string().email().safeParse(value).success,
        { message: field.errorText || "Please enter a valid email address." },
      );
    }

    if (field.type === "date") {
      let schema = z.string().min(1, requiredMessage);
      if (!isRequired) schema = z.string();

      return schema
        .refine(
          (value) => value === "" || !Number.isNaN(new Date(value).getTime()),
          { message: field.errorText || "Please enter a valid date." },
        )
        .refine(
          (value) => {
            if (!value) return !isRequired;
            const age = getAge(new Date(value));
            return field.min === undefined || age >= field.min;
          },
          {
            message:
              field.errorText || `You must be at least ${field.min} years old.`,
          },
        )
        .refine(
          (value) => {
            if (!value) return !isRequired;
            const age = getAge(new Date(value));
            return field.max === undefined || age <= field.max;
          },
          {
            message: field.errorText || `Age must be ${field.max} years or below.`,
          },
        );
    }

    if (field.type === "select") {
      let schema = z.string();
      if (isRequired) schema = schema.min(1, requiredMessage);
      return schema.refine(
        (value) =>
          !value ||
          !field.options?.length ||
          field.options.some((option) => option.value === value),
        { message: field.errorText || "Please select a valid option." },
      );
    }

    if (field.type === "multiselect") {
      let schema = z.array(z.string());
      if (isRequired) schema = schema.min(1, requiredMessage);
      return schema.refine(
        (selectedValues) =>
          !field.options?.length ||
          selectedValues.every((value) =>
            field.options?.some((option) => option.value === value),
          ),
        { message: field.errorText || "Please select valid options." },
      );
    }

    if (field.type === "range") {
      return z.array(z.number()).length(2);
    }

    if (field.type === "slider") {
      return z.number();
    }

    return z.any();
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

export function buildOnboardingPayload(
  screen: Screen,
  formValues: Record<string, unknown>,
) {
  const userData: Record<string, unknown> = {};
  const userPreferenceData: Record<string, any> = {};
  let password = "";

  screen.fields.forEach((field) => {
    const value = formValues[field.name];

    if (field.place === "user") {
      userData[field.name] = value;
      if (field.name === "languages") {
        userPreferenceData[field.name] = value;
      }
    }

    if (field.place === "prefrence") {
      if (GOAL_FIELD_MAP[field.name]) {
        userPreferenceData.goal ??= {};
        userPreferenceData.goal[GOAL_FIELD_MAP[field.name]] = value;
      } else {
        userPreferenceData[field.name] = value;
      }
    }

    if (field.place === "password") {
      password = String(value || "");
    }

  });

  return { userData, userPreferenceData, password };
}
