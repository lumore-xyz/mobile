import MultiSelectChipInput from "@/src/components/ui/MultiSelectChipInput";
import {
  bloodTypeOptions,
  dietOptions,
  drinkingOptions,
  genderOptions,
  interestedInOptions,
  interestOptions,
  languageOptions,
  maritalStatusOptions,
  personalityTypeOptions,
  petOptions,
  religionOptions,
  relationshipTypeOptions,
  smokingOptions,
  zodiacOptions,
} from "@/src/libs/optionsCatalog";
import type { SelectOption } from "@/src/libs/optionsCatalog";

interface OptionFieldConfig {
  label: string;
  options: SelectOption[];
  placeholder: string;
  multiple?: boolean;
  max?: number;
  maxHeight?: number;
  helperText?: string;
}

const OPTION_FIELDS: Record<string, OptionFieldConfig> = {
  bloodGroup: {
    label: "Blood Group",
    options: bloodTypeOptions,
    placeholder: "Select your blood group",
  },
  interests: {
    label: "Interests",
    options: interestOptions,
    placeholder: "What excites you the most?",
    helperText: "What excites you the most?",
    multiple: true,
    max: 5,
  },
  gender: {
    label: "Gender",
    options: genderOptions,
    placeholder: "Select your gender",
  },
  diet: {
    label: "Diet",
    options: dietOptions,
    placeholder: "Select your diet",
  },
  zodiacSign: {
    label: "Zodiac Sign",
    options: zodiacOptions,
    placeholder: "Select your zodiac sign",
  },
  maritalStatus: {
    label: "Marital Status",
    options: maritalStatusOptions,
    placeholder: "What is your marital status?",
  },
  languages: {
    label: "Languages",
    options: languageOptions,
    placeholder: "What languages do you speak?",
    multiple: true,
    max: 5,
    maxHeight: 500,
  },
  personalityType: {
    label: "Personality Type",
    options: personalityTypeOptions,
    placeholder: "What is your personality type?",
  },
  religion: {
    label: "Religion",
    options: religionOptions,
    placeholder: "What is your religion?",
  },
  interestedIn: {
    label: "Interested In",
    options: interestedInOptions,
    placeholder: "Select gender preferences",
  },
  relationshipType: {
    label: "Relationship Type",
    options: relationshipTypeOptions,
    placeholder: "Select relationship type",
  },
  zodiacPreference: {
    label: "Zodiac Preferences",
    options: zodiacOptions,
    placeholder: "Select zodiac preferences",
    multiple: true,
    max: 5,
  },
  personalityTypePreference: {
    label: "Personality Type Preferences",
    options: personalityTypeOptions,
    placeholder: "Select personality type preferences",
    multiple: true,
    max: 5,
  },
  dietPreference: {
    label: "Diet Preferences",
    options: dietOptions,
    placeholder: "Select diet preferences",
    multiple: true,
    max: 5,
  },
  religionPreference: {
    label: "Religion Preferences",
    options: religionOptions,
    placeholder: "Select religion preferences",
    multiple: true,
    max: 5,
  },
  drinkingPreference: {
    label: "Drinking Preferences",
    options: drinkingOptions,
    placeholder: "Select drinking preferences",
    multiple: true,
    max: 5,
  },
  smokingPreference: {
    label: "Smoking Preferences",
    options: smokingOptions,
    placeholder: "Select smoking preferences",
    multiple: true,
    max: 5,
  },
  petPreference: {
    label: "Pet Preferences",
    options: petOptions,
    placeholder: "Select pet preferences",
    multiple: true,
    max: 5,
  },
};

interface ProfileOptionFieldProps {
  fieldType: string;
  value: unknown;
  setValue: (value: unknown) => void;
}

const ProfileOptionField = ({
  fieldType,
  value,
  setValue,
}: ProfileOptionFieldProps) => {
  const config = OPTION_FIELDS[fieldType];
  if (!config) return null;

  const selectedValue = config.multiple
    ? Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : []
    : typeof value === "string"
      ? value
      : "";

  return (
    <MultiSelectChipInput
      {...config}
      value={selectedValue}
      onChange={setValue}
    />
  );
};

export default ProfileOptionField;
