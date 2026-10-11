import { languageDisplay } from "@/src/utils/helpers/languageDisplay";
import React, { useMemo } from "react";
import { Text, View } from "react-native";
import SectionHeading from "./SectionHeading";
import LifestyleChip from "./LifestyleChip";
import ProfileField from "./ProfileField";
import type { ProfileUser } from "@/src/domain/profile/types";

interface ProfileFieldsListProps {
  user?: ProfileUser;
  onEdit: (field: string) => void;
  onVisibilityChange: (field: string, visibility: string) => void;
}

interface SectionField {
  label: string;
  field: string;
  value?: string | number;
  visibility?: string;
  custom?: boolean;
}

interface Section {
  title: string;
  description: string;
  icon: string;
  fields: SectionField[];
}

const ProfileFieldsList: React.FC<ProfileFieldsListProps> = ({
  user,
  onEdit,
  onVisibilityChange,
}) => {
  const sections = useMemo<Section[]>(() => {
    const interests = user?.interests?.join(", ");
    const languages =
      Array.isArray(user?.languages) && user.languages.length
        ? languageDisplay(user.languages)?.join(", ")
        : undefined;

    return [
    {
      title: "Basics",
      description: "Help people recognize you quickly.",
      icon: "UserRound",
      fields: [
        { label: "Username", field: "username", value: user?.username },
        { label: "Nickname", field: "nickname", value: user?.nickname },
        { label: "Real Name", field: "realName", value: user?.realName },
      ],
    },
    {
      title: "About",
      description: "Share a little about yourself.",
      icon: "MessageCircleHeart",
      fields: [
        { label: "Bio", field: "bio", value: user?.bio },
        { label: "Interests", field: "interests", value: interests },
      ],
    },
    {
      title: "Details",
      description: "Personal details you can control visibility for.",
      icon: "BadgeInfo",
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
      icon: "Sparkles",
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
      icon: "BriefcaseBusiness",
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
  }, [user]);

  return (
    <>
      {sections.map((section) => (
        <View
          key={section.title}
          className="mt-5 rounded-[24px] border border-ui-parchment bg-ui-surface-page p-4"
        >
          <View className="mb-1">
            <SectionHeading
              title={section.title}
              subtitle={section.description}
              icon={section.icon}
            />
          </View>
          {section.fields.map((field) => (
            <ProfileField
              key={field.field}
              label={field.label}
              field={field.field}
              value={field.custom ? undefined : field.value}
              onEdit={onEdit}
              visibility={field.visibility}
              onVisibilityChange={onVisibilityChange}
            >
              {field.custom ? (
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
                    <Text className="text-base text-ui-slate">Not set yet</Text>
                  ) : null}
                </View>
              ) : null}
            </ProfileField>
          ))}
        </View>
      ))}
    </>
  );
};

export default ProfileFieldsList;
