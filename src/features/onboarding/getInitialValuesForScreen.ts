import type { Screen } from "./types";
import goalFieldMap from "./goalFieldMap";
import isRecord from "@/src/utils/isRecord";

export default function getInitialValuesForScreen(
  screen: Screen,
  user: object | undefined,
  userPreference: object | undefined,
) {
  const initialValues: Record<string, unknown> = {};
  const userValues = isRecord(user) ? user : undefined;
  const preferenceValues = isRecord(userPreference) ? userPreference : undefined;

  screen.fields.forEach((field) => {
    if (field.place === "user" && userValues) {
      initialValues[field.name] = userValues[field.name];
      return;
    }

    if (field.place === "prefrence" && preferenceValues) {
      if (goalFieldMap[field.name]) {
        const goals = preferenceValues.goal;
        initialValues[field.name] = isRecord(goals)
          ? goals[goalFieldMap[field.name]]
          : undefined;
      } else {
        initialValues[field.name] = preferenceValues[field.name];
      }
    }
  });

  return initialValues;
}
