import { languageOptions } from "@/src/libs/options";

export const languageDisplay = (value: string[]) => {
  return (
    languageOptions
      .filter((opt) => value?.includes(opt.value))
      .map((opt) => opt.label) || []
  );
};
