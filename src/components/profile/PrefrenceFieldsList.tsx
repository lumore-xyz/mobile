import { languageDisplay } from "@/src/utils/helpers/languageDisplay";
import React from "react";
import { Text, View } from "react-native";
import ProfileField from "./ProfileField";

interface PrefrenceFieldsListProps {
  preferences: any;
  onEdit: (field: string) => void;
  onVisibilityChange?: (field: string, visibility: string) => void;
}

const PrefrenceFieldsList: React.FC<PrefrenceFieldsListProps> = ({
  preferences,
  onEdit,
  onVisibilityChange,
}) => {
  const sections = [
    {
      title: "Core",
      description: "The basics that shape your matches.",
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
  ];

  return (
    <>
      {sections.map((section) => (
        <View key={section.title} className="mt-6">
          <Text className="text-sm text-ui-shade/70 uppercase">
            {section.title}
          </Text>
          <Text className="text-xs text-ui-shade/60 mt-1">
            {section.description}
          </Text>
          {section.fields.map((field) => (
            <ProfileField
              key={field.field}
              label={field.label}
              field={field.field}
              value={field.value}
              onEdit={onEdit}
            />
          ))}
        </View>
      ))}
    </>
  );
};

export default PrefrenceFieldsList;
