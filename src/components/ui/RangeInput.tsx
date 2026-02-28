import MultiSlider from "@ptomasroos/react-native-multi-slider";
import React, { useState } from "react";
import { Text, View } from "react-native";

interface RangeInputProps {
  label: string;
  value: number[];
  onChange: React.Dispatch<React.SetStateAction<number[]>>;
  min: number;
  max: number;
  step?: number;
  helperText?: string;
  errorText?: string;
  unit?: string; // e.g. "yrs", "kg", "%"
}

const RangeInput: React.FC<RangeInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  helperText,
  errorText,
  unit = "",
}) => {
  const [sliderValues, setSliderValues] = useState(value);

  const handleValuesChange = (values: number[]) => {
    setSliderValues(values);
    onChange(values);
  };

  return (
    <View className="border rounded-2xl px-6 py-4 border-ui-shade/20">
      <Text className="font-medium text-typography-900 text-xl mb-2">
        {label}
      </Text>

      {/* Current Selected Range */}
      <Text className="text-lg text-typography-700 mb-3">
        {sliderValues[0]} {unit} - {sliderValues[1]} {unit}
      </Text>

      {/* Multi Thumb Slider */}
      <MultiSlider
        values={sliderValues || [min, max]}
        min={min}
        max={max}
        step={step}
        onValuesChange={handleValuesChange}
        sliderLength={280} // adjust based on container width
        markerStyle={{
          height: 20,
          width: 20,
          borderRadius: 12,
          backgroundColor: "#541388",
        }}
        selectedStyle={{ backgroundColor: "#541388", height: 2 }}
        unselectedStyle={{ backgroundColor: "#0A0A0960", height: 2 }}
      />

      {helperText ? (
        <Text className="text-xl text-typography-500 mt-2">{helperText}</Text>
      ) : null}

      {errorText ? (
        <Text className="text-red-500 mt-2">{errorText}</Text>
      ) : null}
    </View>
  );
};

export default RangeInput;
