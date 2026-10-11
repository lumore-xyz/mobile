import type { Screen } from "./types";
import goalFieldMap from "./goalFieldMap";
import isRecord from "@/src/utils/isRecord";

export default function buildOnboardingPayload(
  screen: Screen,
  formValues: Record<string, unknown>,
) {
  const userData: Record<string, unknown> = {};
  const userPreferenceData: Record<string, unknown> = {};
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
      if (goalFieldMap[field.name]) {
        const existingGoals = userPreferenceData.goal;
        const goals = isRecord(existingGoals) ? existingGoals : {};
        goals[goalFieldMap[field.name]] = value;
        userPreferenceData.goal = goals;
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
