import {
  bloodTypeOptions,
  dietOptions,
  drinkingOptions,
  genderOptions,
  interestOptions,
  languageOptions,
  maritalStatusOptions,
  personalityTypeOptions,
  petOptions,
  religionOptions,
  smokingOptions,
  zodiacOptions,
} from "@/src/libs/options";
import { checkUsernameAvailability } from "@/src/libs/apis";
import * as z from "zod";

const hasOptionValue = (value: string, options: { value: string }[]) =>
  options.some((option) => option.value === value);

const optionValueSchema = (options: { value: string }[], message: string) =>
  z.string().refine((value) => hasOptionValue(value, options), { message });

const max5DynamicOptionArraySchema = (
  options: { value: string }[],
  message: string,
) =>
  z
    .array(z.string())
    .max(5)
    .refine(
      (values) => values.every((value) => hasOptionValue(value, options)),
      { message },
    );

const isAtLeast18 = (dob: string) => {
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 18;
};

export const createProfileSchema = (currentUsername?: string) =>
  z.object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username must be at most 30 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscore",
      )
      .refine(
        async (username) => {
          if (currentUsername && username === currentUsername) return true;
          return checkUsernameAvailability(username);
        },
        { message: "Username is already taken" },
      ),
    nickname: z
      .string()
      .trim()
      .min(1, "Nickname must be at least 1 character")
      .max(50, "Nickname must be at most 50 characters"),
    realName: z
      .string()
      .trim()
      .min(2, "Real name must be at least 2 characters")
      .max(80, "Real name must be at most 80 characters"),
    interests: max5DynamicOptionArraySchema(
      interestOptions,
      "Please select valid interests.",
    ),
    languages: max5DynamicOptionArraySchema(
      languageOptions,
      "Please select valid languages.",
    ),
    bio: z.string().trim().max(500, "Bio must not exceed 500 characters"),
    dob: z
      .string()
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: "Date of birth must be a valid date",
      })
      .refine(isAtLeast18, {
        message: "You must be at least 18 years old",
      }),
    height: z
      .string()
      .regex(/^\d{2,3}$/, "Height must be a valid number in cm")
      .refine((value) => {
        const parsed = Number.parseInt(value, 10);
        return parsed >= 100 && parsed <= 250;
      }, "Height must be between 100cm and 250cm"),
    work: z.string().trim().max(100, "Work must be at most 100 characters").optional(),
    institution: z
      .string()
      .trim()
      .max(100, "Institution must be at most 100 characters")
      .optional(),
    phoneNumber: z
      .string()
      .transform((val) => val.replace(/\s+/g, ""))
      .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
        message:
          "Invalid phone number format. Please enter a valid international phone number.",
      })
      .optional(),
    bloodGroup: optionValueSchema(bloodTypeOptions, "Please select a valid blood group."),
    gender: optionValueSchema(genderOptions, "Please select a valid gender."),
    hometown: z.string().trim().min(1, "Hometown is required"),
    diet: optionValueSchema(dietOptions, "Please select a valid diet."),
    zodiacSign: optionValueSchema(zodiacOptions, "Please select a valid zodiac sign."),
    lifestyle: z.object({
      drinking: optionValueSchema(drinkingOptions, "Please select a valid drinking habit."),
      smoking: optionValueSchema(smokingOptions, "Please select a valid smoking habit."),
      pets: optionValueSchema(petOptions, "Please select a valid pet preference."),
    }),
    maritalStatus: optionValueSchema(maritalStatusOptions, "Please select a valid marital status."),
    personalityType: optionValueSchema(
      personalityTypeOptions,
      "Please select a valid personality type.",
    ),
    religion: optionValueSchema(religionOptions, "Please select a valid religion."),
  });

export const profileSchema = createProfileSchema();

export type ProfileFormValues = z.infer<typeof profileSchema>;
