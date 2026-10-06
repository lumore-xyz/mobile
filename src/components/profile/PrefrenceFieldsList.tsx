import { languageDisplay } from "@/src/utils/helpers/languageDisplay";
import Icon from "@/src/libs/Icon";
import React from "react";
import { Pressable, Text, View } from "react-native";
import type { UserPreferences } from "@/src/hooks/useUserPrefrence";
import { triggerSelectionHaptic } from "@/src/utils/haptics";

interface PrefrenceFieldsListProps {
  preferences?: UserPreferences;
  onEdit: (field: keyof UserPreferences) => void;
}

type PreferenceField = {
  label: string;
  field: keyof UserPreferences;
  value?: string;
};

const PrefrenceFieldsList: React.FC<PrefrenceFieldsListProps> = ({
  preferences,
  onEdit,
}) => {
  const sectionIconByTitle: Record<string, string> = {
    Core: "Compass",
    Intent: "Target",
    Lifestyle: "Sparkles",
    Compatibility: "Puzzle",
  };

  const sections: { title: string; description: string; fields: PreferenceField[] }[] = [
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
        <View
          key={section.title}
          className="mt-8"
        >
          <View className="mb-2 flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-forest/10">
              <Icon name={sectionIconByTitle[section.title] || "SlidersHorizontal"} size={18} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-ink">
                {section.title}
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-slate">
                {section.description}
              </Text>
            </View>
          </View>
          <View className="mt-2">
            {section.fields.map((field) => (
              <Pressable
                key={field.field}
                onPress={() => {
                  triggerSelectionHaptic();
                  onEdit(field.field);
                }}
                className="min-h-[68px] flex-row items-center justify-between gap-4 border-b border-ui-parchment py-3 active:opacity-70"
                accessibilityRole="button"
                accessibilityLabel={`Edit ${field.label}`}
              >
                <View className="flex-1">
                  <Text className="text-[13px] font-medium text-ui-slate">
                    {field.label}
                  </Text>
                  <Text
                    className={`mt-1 text-base leading-6 ${field.value ? "text-ui-ink" : "text-ui-forest"}`}
                    numberOfLines={2}
                  >
                    {field.value || "Add a preference"}
                  </Text>
                </View>
                <View className="h-9 w-9 items-center justify-center rounded-full bg-ui-forest/5">
                  <Icon name="ChevronRight" size={17} />
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </>
  );
};

export default PrefrenceFieldsList;
