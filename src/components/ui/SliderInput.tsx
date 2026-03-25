// components/SingleSlider.tsx
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

interface SingleSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  helperText?: string;
  errorText?: string;
  unit?: string; // e.g. "yrs", "kg", "%"
}

const SingleSlider: React.FC<SingleSliderProps> = ({
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
  const clampValue = (nextValue: number) => {
    if (!Number.isFinite(nextValue)) return min;
    return Math.min(max, Math.max(min, nextValue));
  };

  const [sliderValue, setSliderValue] = useState(clampValue(value));

  useEffect(() => {
    setSliderValue(clampValue(value));
  }, [value, min, max]);

  const handleValueChange = (values: number[]) => {
    const nextValue = clampValue(values[0]);
    setSliderValue(nextValue);
    onChange(nextValue);
  };

  return (
    <View className="border rounded-2xl px-6 py-4 border-ui-shade/20">
      {/* Label */}
      <Text className="font-medium text-typography-900 text-xl mb-2">
        {label}
      </Text>

      {/* Current Value */}
      <Text className="text-lg text-typography-700 mb-3">
        {sliderValue} {unit}
      </Text>

      {/* Single Thumb Slider */}
      <MultiSlider
        values={[sliderValue]}
        min={min}
        max={max}
        step={step}
        onValuesChange={handleValueChange}
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

      {/* Helper & Error Text */}
      {helperText ? (
        <Text className="text-xl text-typography-500 mt-2">{helperText}</Text>
      ) : null}

      {errorText ? (
        <Text className="text-red-500 mt-2">{errorText}</Text>
      ) : null}
    </View>
  );
};

export default SingleSlider;
