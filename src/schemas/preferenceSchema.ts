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
} from "@/src/libs/optionsCatalog";
import max5OptionArraySchema from "./max5OptionArraySchema";
import optionValueSchema from "./optionValueSchema";
import { z } from "zod/mini";

export const preferenceSchema = z.object({
  interestedIn: optionValueSchema(
    interestedInOptions,
    "Please select a valid preference.",
  ),
  ageRange: z.array(z.number()).check(
    z.length(2),
    z.refine(([min, max]) => min >= 18 && max <= 50 && min <= max, {
      error: "Age range must be between 18 and 50, and minimum <= maximum.",
    }),
  ),
  distance: z.number().check(z.minimum(1), z.maximum(100)),
  heightRange: z.array(z.number()).check(
    z.length(2),
    z.refine(([min, max]) => min >= 140 && max <= 220 && min <= max, {
      error: "Height range must be between 140cm and 220cm, and minimum <= maximum.",
    }),
  ),
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
  interests: max5OptionArraySchema(
    interestOptions,
    "Please select valid interests.",
    "You can select up to 5 options.",
  ),
  relationshipType: optionValueSchema(
    relationshipTypeOptions,
    "Please select a valid relationship type.",
    ["Not Specified"],
  ),
  languages: max5OptionArraySchema(
    languageOptions,
    "Please select valid languages.",
    "You can select up to 5 options.",
  ),
  zodiacPreference: max5OptionArraySchema(
    zodiacOptions,
    "Please select valid zodiac preferences.",
    "You can select up to 5 options.",
  ),
  personalityTypePreference: max5OptionArraySchema(
    personalityTypeOptions,
    "Please select valid personality preferences.",
    "You can select up to 5 options.",
  ),
  dietPreference: max5OptionArraySchema(
    dietOptions,
    "Please select valid diet preferences.",
    "You can select up to 5 options.",
  ),
  religionPreference: max5OptionArraySchema(
    religionOptions,
    "Please select valid religion preferences.",
    "You can select up to 5 options.",
  ),
  drinkingPreference: max5OptionArraySchema(
    drinkingOptions,
    "Please select valid drinking preferences.",
    "You can select up to 5 options.",
  ),
  smokingPreference: max5OptionArraySchema(
    smokingOptions,
    "Please select valid smoking preferences.",
    "You can select up to 5 options.",
  ),
  petPreference: max5OptionArraySchema(
    petOptions,
    "Please select valid pet preferences.",
    "You can select up to 5 options.",
  ),
});
