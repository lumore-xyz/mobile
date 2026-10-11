import DateInput from "@/src/components/ui/DateInput";
import HeightInput from "@/src/components/profile/HeightInput";
import SingleSelectFieldGroup from "@/src/components/profile/SingleSelectFieldGroup";
import ProfileOptionField from "@/src/components/profile/ProfileOptionField";
import TextAreaInput from "@/src/components/ui/TextAreaInput";
import { TextInput } from "@/src/components/ui/TextInput";
import UsernameAvailabilityFeedback from "@/src/components/profile/UsernameAvailabilityFeedback";
import type { UsernameAvailabilityStatus } from "@/src/hooks/useUsernameAvailability";
import { drinkingOptions, goalOptions, petOptions, smokingOptions } from "@/src/libs/optionsCatalog";
import isRecord from "@/src/utils/isRecord";
import React from "react";
import { View } from "react-native";
import RangeInput from "../ui/RangeInput";
import SingleSlider from "../ui/SliderInput";

interface FieldEditorContentProps {
  fieldType: string;
  value: unknown;
  setValue: (value: unknown) => void;
  usernameAvailability?: {
    status: UsernameAvailabilityStatus;
    message: string;
    isChecking: boolean;
  };
}

const TEXT_FIELD_CONFIG: Record<string, { label: string; placeholder: string }> = {
  nickname: { label: "Nickname", placeholder: "Enter your nickname" },
  realName: { label: "Real Name", placeholder: "Enter your real name" },
  phoneNumber: {
    label: "Phone Number",
    placeholder: "Enter your phone number (e.g., +917021245436)",
  },
  email: { label: "Email", placeholder: "Enter your email" },
  web3Wallet: { label: "Wallet Address", placeholder: "Enter your wallet address" },
  work: { label: "Work", placeholder: "What do you do?" },
  institution: { label: "Institution", placeholder: "Where did you study?" },
};

const LIFESTYLE_FIELDS = [
  {
    key: "drinking",
    label: "Drinking Habit",
    placeholder: "How often do you drink?",
    options: drinkingOptions,
  },
  {
    key: "smoking",
    label: "Smoking Habit",
    placeholder: "How often do you smoke?",
    options: smokingOptions,
  },
  { key: "pets", label: "Pets", placeholder: "Do you have a pet?", options: petOptions },
];

const GOAL_FIELDS = [
  {
    key: "primary",
    label: "What's Your Primary Goal?",
    placeholder: "My goal is...",
    helperText:
      "This helps us match you with like-minded people. (And won't be shown on your profile)",
  },
  {
    key: "secondary",
    label: "What's your next priority?",
    placeholder: "My backup is...",
    helperText:
      "If not your primary goal, what else matters to you? (Also won't be shown on your profile)",
  },
  {
    key: "tertiary",
    label: "Any other goals or intentions?",
    placeholder: "My backup of backup is...",
    helperText:
      "What's another reason you're here? (Also won't be shown on your profile)",
  },
];

const FieldEditorContent: React.FC<FieldEditorContentProps> = ({
  fieldType,
  value,
  setValue,
  usernameAvailability,
}) => {
  const stringValue = typeof value === "string" ? value : "";
  const stringRecord: Record<string, string> =
    isRecord(value)
      ? Object.fromEntries(
          Object.entries(value).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : {};
  const textFieldConfig = TEXT_FIELD_CONFIG[fieldType];

  if (textFieldConfig) {
    const { label, placeholder } = textFieldConfig;
    return (
      <TextInput
        value={stringValue}
        action={(text) =>
          setValue(
            fieldType === "phoneNumber" ? text.replace(/\s+/g, "") : text,
          )
        }
        label={label}
        type="text"
        placeholder={placeholder}
      />
    );
  }

  switch (fieldType) {
    case "username":
      return (
        <View>
          <TextInput
            value={stringValue}
            action={(text: string) => setValue(text)}
            label="Username"
            type="text"
            placeholder="Enter unique username"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            isInvalid={
              usernameAvailability?.status === "invalid" ||
              usernameAvailability?.status === "taken"
            }
          />
          {usernameAvailability ? (
            <UsernameAvailabilityFeedback
              status={usernameAvailability.status}
              message={usernameAvailability.message}
              isChecking={usernameAvailability.isChecking}
            />
          ) : null}
        </View>
      );

    case "bio":
      return (
        <TextAreaInput
          label="Bio"
          value={stringValue}
          type="text"
          action={(text: string) => setValue(text)}
          placeholder="A short line that sounds like you."
          helperText="Specific details beat generic bios. Give someone an easy opener."
        />
      );

    case "dob":
      return (
        <DateInput
          label="Date of Birth"
          date={stringValue ? new Date(stringValue) : undefined}
          onChange={(date) =>
            setValue(date ? new Date(date).toISOString().split("T")[0] : "")
          }
        />
      );

    case "height":
      return (
        <HeightInput
          value={typeof value === "string" || typeof value === "number" ? value : undefined}
          setValue={setValue}
        />
      );

    case "lifestyle":
      return (
        <SingleSelectFieldGroup
          fields={LIFESTYLE_FIELDS}
          options={drinkingOptions}
          values={stringRecord}
          onChange={(key, option) => setValue({ ...stringRecord, [key]: option })}
        />
      );

    case "ageRange":
      return (
        <RangeInput
          label="Age Range"
          value={
            Array.isArray(value) &&
            value.every((item): item is number => typeof item === "number")
              ? value
              : [18, 99]
          }
          onChange={(range) => setValue(range)}
          min={18}
          max={100}
          step={1}
          unit={"y"}
          helperText={"Select the age range you are interested in."}
        />
      );
    case "distance":
      return (
        <SingleSlider
          label="Maximum Distance (km)"
          min={1}
          max={100}
          step={1}
          value={
            typeof value === "number" && Number.isFinite(value) ? value : 10
          }
          unit="km"
          onChange={(val) => setValue(val)}
          helperText={"How far are you willing to go?"}
          // errorText={errors[field.name]}
        />
      );
    case "heightRange":
      return (
        <RangeInput
          label="Height Range (cm)"
          value={
            Array.isArray(value) &&
            value.every((item): item is number => typeof item === "number")
              ? value
              : [150, 200]
          }
          onChange={(range) => setValue(range)}
          min={140}
          max={220}
          step={1}
          unit={"cm"}
          helperText={"Select the height range you prefer."}
        />
      );
    case "goal":
      return (
        <SingleSelectFieldGroup
          className="mt-2 gap-4"
          fields={GOAL_FIELDS}
          options={goalOptions}
          values={stringRecord}
          onChange={(key, option) => setValue({ ...stringRecord, [key]: option })}
        />
      );

    default:
      return (
        <ProfileOptionField
          fieldType={fieldType}
          value={value}
          setValue={setValue}
        />
      );
  }
};

export default FieldEditorContent;
