import Icon from "@/src/libs/Icon";
import { languageDisplay } from "@/src/utils/helpers/languageDisplay";
import React from "react";
import { Text, View } from "react-native";
import ProfileField from "./ProfileField";

interface ProfileFieldsListProps {
  user: any;
  onEdit: (field: string) => void;
  onVisibilityChange: (field: string, visibility: string) => void;
}

interface SectionField {
  label: string;
  field: string;
  value?: any;
  visibility?: string;
  custom?: boolean;
}

interface Section {
  title: string;
  description: string;
  fields: SectionField[];
}

const ProfileFieldsList: React.FC<ProfileFieldsListProps> = ({
  user,
  onEdit,
  onVisibilityChange,
}) => {
  const interests =
    Array.isArray(user?.interests) && user?.interests?.length
      ? user.interests.join(", ")
      : user?.interests;
  const languages =
    Array.isArray(user?.languages) && user?.languages?.length
      ? languageDisplay(user.languages)?.join(", ")
      : undefined;

  const sections: Section[] = [
    {
      title: "Basics",
      description: "Help people recognize you quickly.",
      fields: [
        { label: "Username", field: "username", value: user?.username },
        { label: "Nickname", field: "nickname", value: user?.nickname },
        { label: "Real Name", field: "realName", value: user?.realName },
      ],
    },
    {
      title: "About",
      description: "Share a little about yourself.",
      fields: [
        { label: "Bio", field: "bio", value: user?.bio },
        { label: "Interests", field: "interests", value: interests },
      ],
    },
    {
      title: "Details",
      description: "Personal details you can control visibility for.",
      fields: [
        { label: "Gender", field: "gender", value: user?.gender },
        {
          label: "Birthday",
          field: "dob",
          value: user?.dob
            ? new Date(user?.dob).toLocaleDateString()
            : undefined,
        },
        {
          label: "Blood Group",
          field: "bloodGroup",
          value: user?.bloodGroup,
          visibility: user?.fieldVisibility?.bloodGroup,
        },
        {
          label: "Height",
          field: "height",
          value: user?.height ? `${user?.height}cm` : undefined,
          visibility: user?.fieldVisibility?.height,
        },
        {
          label: "Religion",
          field: "religion",
          value: user?.religion,
          visibility: user?.fieldVisibility?.religion,
        },
        {
          label: "Marital Status",
          field: "maritalStatus",
          value: user?.maritalStatus,
          visibility: user?.fieldVisibility?.maritalStatus,
        },
      ],
    },
    {
      title: "Lifestyle",
      description: "Lifestyle helps build better matches.",
      fields: [
        {
          label: "Diet",
          field: "diet",
          value: user?.diet,
          visibility: user?.fieldVisibility?.diet,
        },
        {
          label: "Zodiac Sign",
          field: "zodiacSign",
          value: user?.zodiacSign,
          visibility: user?.fieldVisibility?.zodiacSign,
        },
        {
          label: "Lifestyle",
          field: "lifestyle",
          custom: true,
          visibility: user?.fieldVisibility?.lifestyle,
        },
      ],
    },
    {
      title: "Background",
      description: "Education, work, and languages.",
      fields: [
        {
          label: "Work",
          field: "work",
          value: user?.work,
          visibility: user?.fieldVisibility?.work,
        },
        {
          label: "University",
          field: "institution",
          value: user?.institution,
          visibility: user?.fieldVisibility?.institution,
        },
        {
          label: "Languages",
          field: "languages",
          value: languages,
          visibility: user?.fieldVisibility?.languages,
        },
        {
          label: "Personality Type",
          field: "personalityType",
          value: user?.personalityType,
          visibility: user?.fieldVisibility?.personalityType,
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
          {section.fields.map((field) =>
            field.custom ? (
              <ProfileField
                key={field.field}
                label={field.label}
                field={field.field}
                onEdit={onEdit}
                visibility={field.visibility}
                onVisibilityChange={onVisibilityChange}
              >
                {user?.lifestyle?.drinking && (
                  <Text className="flex items-center gap-2">
                    <Icon type="Ionicons" name="beer-outline" />{" "}
                    {user?.lifestyle?.drinking}
                  </Text>
                )}
                {user?.lifestyle?.smoking && (
                  <Text className="flex items-center gap-2">
                    <Icon type="MaterialIcons" name="smoking-rooms" />{" "}
                    {user?.lifestyle?.smoking}
                  </Text>
                )}
                {user?.lifestyle?.pets && (
                  <Text className="flex items-center gap-2">
                    <Icon type="MaterialCommunityIcons" name="paw" />{" "}
                    {user?.lifestyle?.pets}
                  </Text>
                )}
              </ProfileField>
            ) : (
              <ProfileField
                key={field.field}
                label={field.label}
                field={field.field}
                value={field.value}
                onEdit={onEdit}
                visibility={field.visibility}
                onVisibilityChange={onVisibilityChange}
              />
            )
          )}
        </View>
      ))}
    </>
  );
};

export default ProfileFieldsList;
