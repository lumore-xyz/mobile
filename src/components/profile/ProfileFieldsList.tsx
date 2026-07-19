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
  icon: string;
  fields: SectionField[];
}

const sectionIconByTitle: Record<string, string> = {
  Basics: "UserRound",
  About: "MessageCircleHeart",
  Details: "BadgeInfo",
  Lifestyle: "Sparkles",
  Background: "BriefcaseBusiness",
};

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
      icon: sectionIconByTitle.Basics,
      fields: [
        { label: "Username", field: "username", value: user?.username },
        { label: "Nickname", field: "nickname", value: user?.nickname },
        { label: "Real Name", field: "realName", value: user?.realName },
      ],
    },
    {
      title: "About",
      description: "Share a little about yourself.",
      icon: sectionIconByTitle.About,
      fields: [
        { label: "Bio", field: "bio", value: user?.bio },
        { label: "Interests", field: "interests", value: interests },
      ],
    },
    {
      title: "Details",
      description: "Personal details you can control visibility for.",
      icon: sectionIconByTitle.Details,
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
      icon: sectionIconByTitle.Lifestyle,
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
      icon: sectionIconByTitle.Background,
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
        <View
          key={section.title}
          className="mt-5 rounded-[28px] border border-ui-border bg-ui-surface-page p-4"
        >
          <View className="mb-1 flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-ui-highlight/10">
              <Icon name={section.icon} size={18} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-ui-shade">
                {section.title}
              </Text>
              <Text className="mt-1 text-sm leading-5 text-ui-muted">
                {section.description}
              </Text>
            </View>
          </View>
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
                <View className="mt-1 flex-row flex-wrap gap-2">
                  {user?.lifestyle?.drinking ? (
                    <LifestyleChip icon="Beer" label={user.lifestyle.drinking} />
                  ) : null}
                  {user?.lifestyle?.smoking ? (
                    <LifestyleChip
                      icon="Cigarette"
                      label={user.lifestyle.smoking}
                    />
                  ) : null}
                  {user?.lifestyle?.pets ? (
                    <LifestyleChip icon="PawPrint" label={user.lifestyle.pets} />
                  ) : null}
                  {!user?.lifestyle?.drinking &&
                  !user?.lifestyle?.smoking &&
                  !user?.lifestyle?.pets ? (
                    <Text className="text-base text-ui-muted">Not set yet</Text>
                  ) : null}
                </View>
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

const LifestyleChip = ({ icon, label }: { icon: string; label: string }) => (
  <View className="flex-row items-center gap-1.5 rounded-full bg-ui-highlight/10 px-3 py-1.5">
    <Icon name={icon} size={14} />
    <Text className="text-sm font-medium text-ui-shade">{label}</Text>
  </View>
);

export default ProfileFieldsList;
