import { TextInput } from "@/src/components/ui/TextInput";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";

type HeightUnit = "cm" | "ft";

const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

const digitsOnly = (text: string) => text.replace(/\D/g, "");

const cmToFeetParts = (cmValue: string | number | null | undefined) => {
  const cm = Number.parseInt(String(cmValue || ""), 10);
  if (!Number.isFinite(cm) || cm <= 0) return { feet: "", inches: "" };

  const totalInches = Math.round(cm / CM_PER_INCH);
  return {
    feet: String(Math.floor(totalInches / INCHES_PER_FOOT)),
    inches: String(totalInches % INCHES_PER_FOOT),
  };
};

const cmToFeetLabel = (cmValue: string | number | null | undefined) => {
  const { feet, inches } = cmToFeetParts(cmValue);
  return feet ? `${feet} ft ${inches || "0"} in` : "";
};

const feetPartsToCm = (feet: string, inches: string) => {
  if (!feet) return "";

  const parsedFeet = Number.parseInt(feet, 10);
  const parsedInches = Number.parseInt(inches || "0", 10);
  if (!Number.isFinite(parsedFeet) || parsedFeet <= 0) return "";

  return String(
    Math.round((parsedFeet * INCHES_PER_FOOT + (parsedInches || 0)) * CM_PER_INCH),
  );
};

interface HeightInputProps {
  value: string | number | null | undefined;
  setValue: (value: string) => void;
}

export default function HeightInput({ value, setValue }: HeightInputProps) {
  const cmValue = String(value || "");
  const [unit, setUnit] = useState<HeightUnit>("cm");
  const initialFeetPartsRef = useRef(cmToFeetParts(cmValue));
  const [feet, setFeet] = useState(initialFeetPartsRef.current.feet);
  const [inches, setInches] = useState(initialFeetPartsRef.current.inches);
  const feetLabel = useMemo(() => cmToFeetLabel(cmValue), [cmValue]);

  useEffect(() => {
    if (unit !== "ft" || feetPartsToCm(feet, inches) === cmValue) return;
    const nextParts = cmToFeetParts(cmValue);
    setFeet(nextParts.feet);
    setInches(nextParts.inches);
  }, [cmValue, feet, inches, unit]);

  const selectUnit = (nextUnit: HeightUnit) => {
    if (nextUnit !== unit) triggerSelectionHaptic();
    setUnit(nextUnit);
    if (nextUnit === "ft") {
      const nextParts = cmToFeetParts(cmValue);
      setFeet(nextParts.feet);
      setInches(nextParts.inches);
    }
  };

  const updateCm = (text: string) => setValue(digitsOnly(text));
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
      <Text className="mb-2 text-base font-bold text-ui-ink">Choose height unit</Text>
      <View className="mb-4 flex-row rounded-full bg-ui-surface-page p-1">
        <Pressable
          onPress={() => selectUnit("cm")}
          className={`min-h-11 flex-1 justify-center rounded-full py-2 ${unit === "cm" ? "bg-ui-paper" : ""}`}
          accessibilityRole="button"
          accessibilityState={{ selected: unit === "cm" }}
        >
          <Text className={`text-center text-sm font-medium ${unit === "cm" ? "text-ui-forest" : "text-ui-ink"}`}>
            Centimeters
          </Text>
        </Pressable>
        <Pressable
          onPress={() => selectUnit("ft")}
          className={`min-h-11 flex-1 justify-center rounded-full py-2 ${unit === "ft" ? "bg-ui-paper" : ""}`}
          accessibilityRole="button"
          accessibilityState={{ selected: unit === "ft" }}
        >
          <Text className={`text-center text-sm font-medium ${unit === "ft" ? "text-ui-forest" : "text-ui-ink"}`}>
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
          helperText={cmValue ? `Saved as ${cmValue} cm${feetLabel ? ` (${feetLabel})` : ""}.` : "Enter height between 100cm and 250cm."}
        />
      ) : (
        <View>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <TextInput value={feet} action={updateFeet} label="Feet" type="text" placeholder="5" keyboardType="number-pad" />
            </View>
            <View className="flex-1">
              <TextInput value={inches} action={updateInches} label="Inches" type="text" placeholder="9" keyboardType="number-pad" />
            </View>
          </View>
          <Text className="mt-2 text-sm leading-5 text-ui-slate">
            {cmValue ? `Saved as ${cmValue} cm. Inches should be 0-11.` : "Enter feet and inches; we'll save it in centimeters."}
          </Text>
        </View>
      )}
    </View>
  );
}
