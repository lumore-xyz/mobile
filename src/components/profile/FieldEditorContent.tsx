import DateInput from "@/src/components/ui/DateInput";
import MultiSelectChipInput from "@/src/components/ui/MultiSelectChipInput";
import { TextAreaInput, TextInput } from "@/src/components/ui/TextInput";
import type { UsernameAvailabilityStatus } from "@/src/hooks/useUsernameAvailability";
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
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import RangeInput from "../ui/RangeInput";
import SingleSlider from "../ui/SliderInput";

interface FieldEditorContentProps {
  fieldType: string;
  value: any;
  setValue: (value: any) => void;
  usernameAvailability?: {
    status: UsernameAvailabilityStatus;
    message: string;
    isChecking: boolean;
  };
}

const usernameStatusStyles: Record<
  UsernameAvailabilityStatus,
  {
    color: string;
    icon?: keyof typeof Ionicons.glyphMap;
  }
> = {
  idle: { color: "#667085", icon: "information-circle-outline" },
  invalid: { color: "#EF4444", icon: "alert-circle-outline" },
  current: { color: "#667085", icon: "person-circle-outline" },
  checking: { color: "#541388" },
  available: { color: "#15803D", icon: "checkmark-circle-outline" },
  taken: { color: "#EF4444", icon: "close-circle-outline" },
  error: { color: "#B45309", icon: "warning-outline" },
};

type HeightUnit = "cm" | "ft";

const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

const digitsOnly = (text: string) => text.replace(/\D/g, "");

const cmToFeetParts = (cmValue: string | number | null | undefined) => {
  const cm = Number.parseInt(String(cmValue || ""), 10);
  if (!Number.isFinite(cm) || cm <= 0) {
    return { feet: "", inches: "" };
  }

  const totalInches = Math.round(cm / CM_PER_INCH);
  return {
    feet: String(Math.floor(totalInches / INCHES_PER_FOOT)),
    inches: String(totalInches % INCHES_PER_FOOT),
  };
};

const cmToFeetLabel = (cmValue: string | number | null | undefined) => {
  const { feet, inches } = cmToFeetParts(cmValue);
  if (!feet) return "";
  return `${feet} ft ${inches || "0"} in`;
};

const feetPartsToCm = (feet: string, inches: string) => {
  if (!feet) return "";

  const parsedFeet = Number.parseInt(feet, 10);
  const parsedInches = Number.parseInt(inches || "0", 10);
  if (!Number.isFinite(parsedFeet) || parsedFeet <= 0) return "";

  const totalInches = parsedFeet * INCHES_PER_FOOT + (parsedInches || 0);
  return String(Math.round(totalInches * CM_PER_INCH));
};

const UsernameAvailabilityFeedback = ({
  status,
  message,
  isChecking,
}: {
  status: UsernameAvailabilityStatus;
  message: string;
  isChecking: boolean;
}) => {
  if (!message) return null;

  const style = usernameStatusStyles[status];

  return (
    <View className="mt-2 flex-row items-center gap-2">
      {isChecking ? (
        <ActivityIndicator size="small" color={style.color} />
      ) : style.icon ? (
        <Ionicons name={style.icon} size={16} color={style.color} />
      ) : null}
      <Text className="text-sm" style={{ color: style.color }}>
        {message}
      </Text>
    </View>
  );
};

const HeightInput = ({
  value,
  setValue,
}: {
  value: string | number | null | undefined;
  setValue: (value: string) => void;
}) => {
  const cmValue = String(value || "");
  const [unit, setUnit] = useState<HeightUnit>("cm");
  const initialFeetPartsRef = useRef(cmToFeetParts(cmValue));
  const [feet, setFeet] = useState(initialFeetPartsRef.current.feet);
  const [inches, setInches] = useState(initialFeetPartsRef.current.inches);

  const feetLabel = useMemo(() => cmToFeetLabel(cmValue), [cmValue]);

  useEffect(() => {
    if (unit !== "ft") return;
    if (feetPartsToCm(feet, inches) === cmValue) return;

    const nextParts = cmToFeetParts(cmValue);
    setFeet(nextParts.feet);
    setInches(nextParts.inches);
  }, [cmValue, feet, inches, unit]);

  const selectUnit = (nextUnit: HeightUnit) => {
    setUnit(nextUnit);
    if (nextUnit === "ft") {
      const nextParts = cmToFeetParts(cmValue);
      setFeet(nextParts.feet);
      setInches(nextParts.inches);
    }
  };

  const updateCm = (text: string) => {
    setValue(digitsOnly(text));
  };

  const updateFeet = (text: string) => {
    const nextFeet = digitsOnly(text).slice(0, 1);
    setFeet(nextFeet);
    setValue(feetPartsToCm(nextFeet, inches));
  };

  const updateInches = (text: string) => {
    const digits = digitsOnly(text).slice(0, 2);
    const nextInches = digits
      ? String(Math.min(Number.parseInt(digits, 10), 11))
      : "";
    setInches(nextInches);
    setValue(feetPartsToCm(feet, nextInches));
  };

  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-ui-shade">
        Choose height unit
      </Text>
      <View className="mb-4 flex-row rounded-2xl bg-ui-shade/5 p-1">
        <Pressable
          onPress={() => selectUnit("cm")}
          className={`flex-1 rounded-xl py-2 ${
            unit === "cm" ? "bg-white" : ""
          }`}
          accessibilityRole="button"
          accessibilityState={{ selected: unit === "cm" }}
        >
          <Text
            className={`text-center text-sm font-medium ${
              unit === "cm" ? "text-ui-highlight" : "text-ui-shade"
            }`}
          >
            Centimeters
          </Text>
        </Pressable>
        <Pressable
          onPress={() => selectUnit("ft")}
          className={`flex-1 rounded-xl py-2 ${
            unit === "ft" ? "bg-white" : ""
          }`}
          accessibilityRole="button"
          accessibilityState={{ selected: unit === "ft" }}
        >
          <Text
            className={`text-center text-sm font-medium ${
              unit === "ft" ? "text-ui-highlight" : "text-ui-shade"
            }`}
          >
            Feet
          </Text>
        </Pressable>
      </View>

      {unit === "cm" ? (
        <TextInput
          value={cmValue}
          action={updateCm}
          label="Height in cm"
          type="text"
          placeholder="Enter your height"
          keyboardType="number-pad"
          helperText={
            cmValue
              ? `Saved as ${cmValue} cm${feetLabel ? ` (${feetLabel})` : ""}.`
              : "Enter height between 100cm and 250cm."
          }
        />
      ) : (
        <View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextInput
                value={feet}
                action={updateFeet}
                label="Feet"
                type="text"
                placeholder="5"
                keyboardType="number-pad"
              />
            </View>
            <View className="flex-1">
              <TextInput
                value={inches}
                action={updateInches}
                label="Inches"
                type="text"
                placeholder="9"
                keyboardType="number-pad"
              />
            </View>
          </View>
          <Text className="mt-1 text-sm text-ui-shade/70">
            {cmValue
              ? `Saved as ${cmValue} cm. Inches should be 0-11.`
              : "Enter feet and inches; we'll save it in centimeters."}
          </Text>
        </View>
      )}
    </View>
  );
};

const FieldEditorContent: React.FC<FieldEditorContentProps> = ({
  fieldType,
  value,
  setValue,
  usernameAvailability,
}) => {
  switch (fieldType) {
    case "username":
      return (
        <View>
          <TextInput
            value={value || ""}
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
      return <HeightInput value={value} setValue={setValue} />;

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
