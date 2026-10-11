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
} from "@/src/libs/optionsCatalog";
import { checkUsernameAvailability } from "@/src/features/authentication/api";
import getAgeFromDate from "@/src/utils/helpers/getAgeFromDate";
import max5OptionArraySchema from "./max5OptionArraySchema";
import optionValueSchema from "./optionValueSchema";
import { z } from "zod/mini";

export const createProfileSchema = (currentUsername?: string) =>
  z.object({
    username: z.string().check(
      z.trim(),
      z.minLength(3, "Username must be at least 3 characters"),
      z.maxLength(30, "Username must be at most 30 characters"),
      z.regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscore",
      )
      ,
      z.refine(
        async (username) => {
          if (currentUsername && username === currentUsername) return true;
          return checkUsernameAvailability(username);
        },
        "Username is already taken",
      ),
    ),
    nickname: z.string().check(
      z.trim(),
      z.minLength(1, "Nickname must be at least 1 character"),
      z.maxLength(50, "Nickname must be at most 50 characters"),
    ),
    realName: z.string().check(
      z.trim(),
      z.minLength(2, "Real name must be at least 2 characters"),
      z.maxLength(80, "Real name must be at most 80 characters"),
    ),
    interests: max5OptionArraySchema(
      interestOptions,
      "Please select valid interests.",
    ),
    languages: max5OptionArraySchema(
      languageOptions,
      "Please select valid languages.",
    ),
    bio: z.string().check(z.trim(), z.maxLength(500, "Bio must not exceed 500 characters")),
    dob: z.string().check(
      z.refine((value) => !Number.isNaN(new Date(value).getTime()), {
        error: "Date of birth must be a valid date",
      }),
      z.refine(
        (value) => getAgeFromDate(value) >= 18,
        { error: "You must be at least 18 years old" },
      ),
    ),
    height: z.string().check(
      z.regex(/^\d{2,3}$/, "Height must be a valid number in cm"),
      z.refine((value) => {
        const parsed = Number.parseInt(value, 10);
        return parsed >= 100 && parsed <= 250;
      }, "Height must be between 100cm and 250cm"),
    ),
    work: z.optional(
      z.string().check(z.trim(), z.maxLength(100, "Work must be at most 100 characters")),
    ),
    institution: z.optional(
      z.string().check(z.trim(), z.maxLength(100, "Institution must be at most 100 characters")),
    ),
    phoneNumber: z.optional(
      z.pipe(
        z.pipe(
          z.string(),
          z.transform((value) => value.replace(/\s+/g, "")),
        ),
        z.string().check(
          z.refine((value) => !value || /^\+?[1-9]\d{1,14}$/.test(value), {
            error: "Invalid phone number format. Please enter a valid international phone number.",
          }),
        ),
      ),
    ),
    bloodGroup: optionValueSchema(bloodTypeOptions, "Please select a valid blood group."),
    gender: optionValueSchema(genderOptions, "Please select a valid gender."),
    hometown: z.string().check(z.trim(), z.minLength(1, "Hometown is required")),
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

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>;
