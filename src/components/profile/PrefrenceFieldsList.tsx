import { languageDisplay } from "@/src/utils/helpers/languageDisplay";
import SectionHeading from "@/src/components/profile/SectionHeading";
import ProfileField from "@/src/components/profile/ProfileField";
import React, { useMemo } from "react";
import { View } from "react-native";
import type { UserPreferences } from "@/src/domain/profile/types";

interface PrefrenceFieldsListProps {
  preferences?: UserPreferences;
  onEdit: (field: keyof UserPreferences) => void;
}

type PreferenceField = {
  label: string;
  field: keyof UserPreferences;
  value?: string;
};

interface PreferenceSection {
  title: string;
  description: string;
  icon: string;
  fields: PreferenceField[];
}

const PrefrenceFieldsList: React.FC<PrefrenceFieldsListProps> = ({
  preferences,
  onEdit,
}) => {
  const sections = useMemo<PreferenceSection[]>(() => [
    {
      title: "Core",
      description: "The basics that shape your matches.",
      icon: "Compass",
      fields: [
        {
          label: "Interested In",
          field: "interestedIn",
          value: preferences?.interestedIn,
        },
        {
          label: "Age Range",
          field: "ageRange",
          value: preferences?.ageRange?.length
            ? `${preferences?.ageRange[0]}y - ${preferences?.ageRange[1]}y`
            : undefined,
        },
        {
          label: "Maximum Distance",
          field: "distance",
          value: preferences?.distance ? `${preferences?.distance} km` : undefined,
        },
        {
          label: "Height Range",
          field: "heightRange",
          value: preferences?.heightRange?.length
            ? `${preferences?.heightRange[0]}cm - ${preferences?.heightRange[1]}cm`
            : undefined,
        },
      ],
    },
    {
      title: "Intent",
      description: "Your relationship and goals.",
      icon: "Target",
      fields: [
        {
          label: "Goals",
          field: "goal",
          value: preferences?.goal
            ? Object.values(preferences?.goal).join(", ")
            : undefined,
        },
        {
          label: "Relationship Type",
          field: "relationshipType",
          value: preferences?.relationshipType,
        },
      ],
    },
    {
      title: "Lifestyle",
      description: "Day-to-day habits and preferences.",
      icon: "Sparkles",
      fields: [
        {
          label: "Diet Preferences",
          field: "dietPreference",
          value: preferences?.dietPreference?.join(", "),
        },
        {
          label: "Drinking Preferences",
          field: "drinkingPreference",
          value: preferences?.drinkingPreference?.join(", "),
        },
        {
          label: "Smoking Preferences",
          field: "smokingPreference",
          value: preferences?.smokingPreference?.join(", "),
        },
        {
          label: "Pet Preferences",
          field: "petPreference",
          value: preferences?.petPreference?.join(", "),
        },
      ],
    },
    {
      title: "Compatibility",
      description: "Match on values and personality.",
      icon: "Puzzle",
      fields: [
        {
          label: "Interests",
          field: "interests",
          value: preferences?.interests?.join(", "),
        },
        {
          label: "Preferred Languages",
          field: "languages",
          value: languageDisplay(preferences?.languages || [])?.join(", "),
        },
        {
          label: "Zodiac Preferences",
          field: "zodiacPreference",
          value: preferences?.zodiacPreference?.join(", "),
        },
        {
          label: "Personality Type Preferences",
          field: "personalityTypePreference",
          value: preferences?.personalityTypePreference?.join(", "),
        },
        {
          label: "Religion Preferences",
          field: "religionPreference",
          value: preferences?.religionPreference?.join(", "),
        },
      ],
    },
  ], [preferences]);

  return (
    <>
      {sections.map((section) => (
        <View
          key={section.title}
          className="mt-8"
        >
          <View className="mb-2">
            <SectionHeading
              title={section.title}
              subtitle={section.description}
              icon={section.icon}
            />
          </View>
          <View className="mt-2">
            {section.fields.map((field) => (
              <ProfileField
                key={field.field}
                label={field.label}
                field={field.field}
                value={field.value}
                onEdit={onEdit}
                variant="list"
                emptyLabel="Add a preference"
              />
            ))}
          </View>
        </View>
      ))}
    </>
  );
};

export default PrefrenceFieldsList;
