import DateInput from "@/src/components/ui/DateInput";
import MultiSelectChipInput from "@/src/components/ui/MultiSelectChipInput";
import { TextAreaInput, TextInput } from "@/src/components/ui/TextInput";
import {
  bloodTypeOptions,
  dietOptions,
  drinkingOptions,
  genderOptions,
  goalOptions,
  interestedInOptions,
  interestOptions,
  languageOptions,
  maritalStatusOptions,
  personalityTypeOptions,
  petOptions,
  relationshipTypeOptions,
  religionOptions,
  smokingOptions,
  zodiacOptions,
} from "@/src/libs/options";
import React from "react";
import { View } from "react-native";
import RangeInput from "../ui/RangeInput";
import SingleSlider from "../ui/SliderInput";

interface FieldEditorContentProps {
  fieldType: string;
  value: any;
  setValue: (value: any) => void;
}

const FieldEditorContent: React.FC<FieldEditorContentProps> = ({
  fieldType,
  value,
  setValue,
}) => {
  switch (fieldType) {
    case "username":
      return (
        <TextInput
          value={value || ""}
          action={(text: string) => setValue(text)}
          label="Username"
          type="text"
          placeholder="Enter unique username"
        />
      );

    case "nickname":
      return (
        <TextInput
          value={value || ""}
          action={(text: string) => setValue(text)}
          label="Nickname"
          type="text"
          placeholder="Enter your nickname"
        />
      );

    case "realName":
      return (
        <TextInput
          label="Real Name"
          value={value || ""}
          type="text"
          action={(text: string) => setValue(text)}
          placeholder="Enter your real name"
        />
      );

    case "phoneNumber":
      return (
        <TextInput
          label="Phone Number"
          value={value || ""}
          type="text"
          action={(text: string) => {
            const formattedValue = text.replace(/\s+/g, "");
            setValue(formattedValue);
          }}
          placeholder="Enter your phone number (e.g., +917021245436)"
        />
      );
    case "email":
      return (
        <TextInput
          label="Email"
          value={value || ""}
          type="text"
          action={(text: string) => setValue(text)}
          placeholder="Enter your email"
        />
      );
    case "web3Wallet":
      return (
        <TextInput
          label="Wallet Address"
          value={value || ""}
          type="text"
          action={(text: string) => setValue(text)}
          placeholder="Enter your wallet address"
        />
      );

    case "bloodGroup":
      return (
        <MultiSelectChipInput
          label="Blood Group"
          options={bloodTypeOptions}
          placeholder="Select your blood group"
          value={value as string}
          onChange={(option) => setValue(option)}
          multiple={false}
        />
      );

    case "interests":
      return (
        <MultiSelectChipInput
          label="Interests"
          options={interestOptions}
          value={value || []}
          max={5}
          onChange={(options) => setValue(options)}
          multiple
          placeholder="What excites you the most?"
          helperText="What excites you the most?"
        />
      );

    case "bio":
      return (
        <TextAreaInput
          label="Bio"
          value={value || ""}
          type="text"
          action={(text: string) => setValue(text)}
          placeholder="Enter your bio"
        />
      );

    case "gender":
      return (
        <MultiSelectChipInput
          label="Gender"
          options={genderOptions}
          placeholder="Select your gender"
          value={value as string}
          onChange={(option) => setValue(option)}
          multiple={false}
        />
      );

    case "dob":
      return (
        <DateInput
          label="Date of Birth"
          date={value ? new Date(value as string) : undefined}
          onChange={(date) =>
            setValue(date ? new Date(date).toISOString().split("T")[0] : "")
          }
        />
      );

    case "height":
      return (
        <TextInput
          value={value || ""}
          action={(text: string) => setValue(text)}
          label="Height in cm."
          type="text"
          placeholder="Enter your height"
        />
      );

    case "diet":
      return (
        <MultiSelectChipInput
          label="Diet"
          options={dietOptions}
          placeholder="Select your diet"
          value={value as string}
          onChange={(option) => setValue(option)}
          multiple={false}
        />
      );

    case "zodiacSign":
      return (
        <MultiSelectChipInput
          label="Zodiac Sign"
          options={zodiacOptions}
          placeholder="Select your zodiac sign"
          value={value as string}
          onChange={(option) => setValue(option)}
          multiple={false}
        />
      );

    case "lifestyle":
      return (
        <>
          <MultiSelectChipInput
            label="Drinking Habit"
            options={drinkingOptions}
            placeholder="How often do you drink?"
            value={value?.drinking}
            onChange={(option) => setValue({ ...value, drinking: option })}
            multiple={false}
          />
          <MultiSelectChipInput
            label="Smoking Habit"
            options={smokingOptions}
            placeholder="How often do you smoke?"
            value={value?.smoking}
            onChange={(option) => setValue({ ...value, smoking: option })}
            multiple={false}
          />
          <MultiSelectChipInput
            label="Pets"
            options={petOptions}
            placeholder="Do you have a pet?"
            value={value?.pets}
            onChange={(option) => setValue({ ...value, pets: option })}
            multiple={false}
          />
        </>
      );

    case "work":
      return (
        <TextInput
          value={value || ""}
          action={(text: string) => setValue(text)}
          label="Work"
          type="text"
          placeholder="What do you do?"
        />
      );

    case "institution":
      return (
        <TextInput
          value={value || ""}
          action={(text: string) => setValue(text)}
          label="Institution"
          type="text"
          placeholder="Where did you study?"
        />
      );

    case "maritalStatus":
      return (
        <MultiSelectChipInput
          label="Marital Status"
          options={maritalStatusOptions}
          placeholder="What is your marital status?"
          value={value}
          onChange={(option) => setValue(option)}
          multiple={false}
        />
      );

    case "languages":
      return (
        <MultiSelectChipInput
          label="Languages"
          options={languageOptions}
          max={5}
          maxHeight={500}
          value={value || []}
          onChange={(selectedValues) => setValue(selectedValues)}
          multiple
          placeholder="What languages do you speak?"
        />
      );

    case "personalityType":
      return (
        <MultiSelectChipInput
          label="Personality Type"
          options={personalityTypeOptions}
          placeholder="What is your personality type?"
          value={value}
          onChange={(option) => setValue(option)}
          multiple={false}
        />
      );

    case "religion":
      return (
        <MultiSelectChipInput
          label="Religion"
          options={religionOptions}
          placeholder="What is your religion?"
          value={value}
          onChange={(option) => setValue(option)}
          multiple={false}
        />
      );
    case "interestedIn":
      return (
        <MultiSelectChipInput
          label="Interested In"
          options={interestedInOptions}
          placeholder="Select gender preferences"
          value={value}
          onChange={(option) => setValue(option)}
          multiple={false}
        />
      );
    case "ageRange":
      return (
        <RangeInput
          label="Age Range"
          value={value || [18, 99]}
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
          value={value || 10}
          unit="km"
          onChange={(val) => setValue(val)}
          helperText={"How far are you willing to go?"}
          // errorText={errors[field.name]}
        />
      );
    case "relationshipType":
      return (
        <MultiSelectChipInput
          label="Relationship Type"
          options={relationshipTypeOptions}
          placeholder="Select relationship type"
          value={value}
          onChange={(option) => setValue(option)}
          multiple={false}
        />
      );
    case "zodiacPreference":
      return (
        <MultiSelectChipInput
          label="Zodiac Preferences"
          options={zodiacOptions}
          max={5}
          value={value || []}
          onChange={(selectedValues) => setValue(selectedValues)}
          multiple
          placeholder="Select zodiac preferences"
        />
      );
    case "personalityTypePreference":
      return (
        <MultiSelectChipInput
          label="Personality Type Preferences"
          options={personalityTypeOptions}
          max={5}
          value={value || []}
          onChange={(selectedValues) => setValue(selectedValues)}
          multiple
          placeholder="Select personality type preferences"
        />
      );
    case "dietPreference":
      return (
        <MultiSelectChipInput
          label="Diet Preferences"
          options={dietOptions}
          max={5}
          value={value || []}
          onChange={(selectedValues) => setValue(selectedValues)}
          multiple
          placeholder="Select diet preferences"
        />
      );
    case "heightRange":
      return (
        <RangeInput
          label="Height Range (cm)"
          value={value || [150, 200]}
          onChange={(range) => setValue(range)}
          min={140}
          max={220}
          step={1}
          unit={"cm"}
          helperText={"Select the height range you prefer."}
        />
      );
    case "religionPreference":
      return (
        <MultiSelectChipInput
          label="Religion Preferences"
          options={religionOptions}
          max={5}
          value={value || []}
          onChange={(selectedValues) => setValue(selectedValues)}
          multiple
          placeholder="Select religion preferences"
        />
      );
    case "drinkingPreference":
      return (
        <MultiSelectChipInput
          label="Drinking Preferences"
          options={drinkingOptions}
          max={5}
          value={value || []}
          onChange={(selectedValues) => setValue(selectedValues)}
          multiple
          placeholder="Select drinking preferences"
        />
      );
    case "smokingPreference":
      return (
        <MultiSelectChipInput
          label="Smoking Preferences"
          options={smokingOptions}
          max={5}
          value={value || []}
          onChange={(selectedValues) => setValue(selectedValues)}
          multiple
          placeholder="Select smoking preferences"
        />
      );
    case "petPreference":
      return (
        <MultiSelectChipInput
          label="Pet Preferences"
          options={petOptions}
          max={5}
          value={value || []}
          onChange={(selectedValues) => setValue(selectedValues)}
          multiple
          placeholder="Select pet preferences"
        />
      );
    case "goal":
      return (
        <View className="flex gap-8 mt-4">
          <MultiSelectChipInput
            label="What's Your Primary Goal?"
            options={goalOptions}
            placeholder="My goal is..."
            value={value?.primary}
            onChange={(option) => setValue({ ...value, primary: option })}
            multiple={false}
            helperText="This helps us match you with like-minded people. (And won't be shown on your profile)"
          />
          <MultiSelectChipInput
            label="What's your next priority?"
            options={goalOptions}
            placeholder="My backup is..."
            value={value?.secondary}
            onChange={(option) => setValue({ ...value, secondary: option })}
            multiple={false}
            helperText="If not your primary goal, what else matters to you? (Also won't be shown on your profile)"
          />
          <MultiSelectChipInput
            label="Any other goals or intentions?"
            options={goalOptions}
            placeholder="My backup of backup is..."
            value={value?.tertiary}
            onChange={(option) => setValue({ ...value, tertiary: option })}
            multiple={false}
            helperText="What's another reason you're here? (Also won't be shown on your profile)"
          />
        </View>
      );

    default:
      return null;
  }
};

export default FieldEditorContent;
