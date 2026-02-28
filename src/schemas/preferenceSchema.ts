import {
  dietOptions,
  drinkingOptions,
  goalOptions,
  interestedInOptions,
  interestOptions,
  languageOptions,
  personalityTypeOptions,
  petOptions,
  relationshipTypeOptions,
  religionOptions,
  smokingOptions,
  zodiacOptions,
} from "@/src/libs/options";
import * as z from "zod";

const max5StringArray = z.array(z.string()).max(5, "You can select up to 5 options.");

const hasOptionValue = (
  value: string,
  options: { value: string }[],
  extras: string[] = [],
) => options.some((option) => option.value === value) || extras.includes(value);

const optionValueSchema = (
  options: { value: string }[],
  message: string,
  extras: string[] = [],
) =>
  z
    .string()
    .refine((value) => hasOptionValue(value, options, extras), { message });

export const preferenceSchema = z.object({
  interestedIn: optionValueSchema(
    interestedInOptions,
    "Please select a valid preference.",
  ),
  ageRange: z
    .array(z.number())
    .length(2)
    .refine(([min, max]) => min >= 18 && max <= 50 && min <= max, {
      message: "Age range must be between 18 and 50, and minimum <= maximum.",
    }),
  distance: z.number().min(1).max(100),
  heightRange: z
    .array(z.number())
    .length(2)
    .refine(([min, max]) => min >= 140 && max <= 220 && min <= max, {
      message: "Height range must be between 140cm and 220cm, and minimum <= maximum.",
    }),
  goal: z.object({
    primary: optionValueSchema(goalOptions, "Please select a valid goal.", [
      "Undecided",
    ]),
    secondary: optionValueSchema(goalOptions, "Please select a valid goal.", [
      "Undecided",
    ]),
    tertiary: optionValueSchema(goalOptions, "Please select a valid goal.", [
      "Undecided",
    ]),
  }),
  interests: max5StringArray.refine(
    (values) => values.every((value) => interestOptions.some((option) => option.value === value)),
    { message: "Please select valid interests." },
  ),
  relationshipType: optionValueSchema(
    relationshipTypeOptions,
    "Please select a valid relationship type.",
    ["Not Specified"],
  ),
  languages: max5StringArray.refine(
    (values) => values.every((value) => languageOptions.some((option) => option.value === value)),
    { message: "Please select valid languages." },
  ),
  zodiacPreference: max5StringArray.refine(
    (values) => values.every((value) => zodiacOptions.some((option) => option.value === value)),
    { message: "Please select valid zodiac preferences." },
  ),
  personalityTypePreference: max5StringArray.refine(
    (values) =>
      values.every((value) =>
        personalityTypeOptions.some((option) => option.value === value),
      ),
    { message: "Please select valid personality preferences." },
  ),
  dietPreference: max5StringArray.refine(
    (values) => values.every((value) => dietOptions.some((option) => option.value === value)),
    { message: "Please select valid diet preferences." },
  ),
  religionPreference: max5StringArray.refine(
    (values) =>
      values.every((value) => religionOptions.some((option) => option.value === value)),
    { message: "Please select valid religion preferences." },
  ),
  drinkingPreference: max5StringArray.refine(
    (values) =>
      values.every((value) => drinkingOptions.some((option) => option.value === value)),
    { message: "Please select valid drinking preferences." },
  ),
  smokingPreference: max5StringArray.refine(
    (values) =>
      values.every((value) => smokingOptions.some((option) => option.value === value)),
    { message: "Please select valid smoking preferences." },
  ),
  petPreference: max5StringArray.refine(
    (values) => values.every((value) => petOptions.some((option) => option.value === value)),
    { message: "Please select valid pet preferences." },
  ),
});
