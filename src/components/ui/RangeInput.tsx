import MultiSlider from "@ptomasroos/react-native-multi-slider";
import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { COLORS } from "@/src/libs/constants/theme";

interface RangeInputProps {
  label: string;
  value: number[];
  onChange: (value: number[]) => void;
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
  const clampValue = useCallback(
    (nextValue: number) => {
      if (!Number.isFinite(nextValue)) return min;
      return Math.min(max, Math.max(min, nextValue));
    },
    [max, min],
  );

  const normalizeRange = useCallback(
    (nextValue: number[]) => {
      if (!Array.isArray(nextValue) || nextValue.length < 2) {
        return [min, max];
      }
      const lower = clampValue(Math.min(nextValue[0], nextValue[1]));
      const upper = clampValue(Math.max(nextValue[0], nextValue[1]));
      return [lower, upper];
    },
    [clampValue, max, min],
  );

  const [sliderValues, setSliderValues] = useState(normalizeRange(value));

  useEffect(() => {
    setSliderValues(normalizeRange(value));
  }, [normalizeRange, value]);

  const handleValuesChange = useCallback(
    (values: number[]) => {
      const nextValues = normalizeRange(values);
      setSliderValues(nextValues);
      onChange(nextValues);
    },
    [normalizeRange, onChange],
  );

  return (
    <View className="rounded-2xl border border-ui-parchment bg-ui-paper px-5 py-4">
      <Text className="mb-2 text-base font-semibold text-ui-ink">
        {label}
      </Text>

      {/* Current Selected Range */}
      <Text className="mb-3 text-base text-ui-slate">
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
          backgroundColor: COLORS.forest,
        }}
        selectedStyle={{ backgroundColor: COLORS.forest, height: 2 }}
        unselectedStyle={{ backgroundColor: `${COLORS.ink}60`, height: 2 }}
      />

      {helperText ? (
        <Text className="mt-2 text-sm text-ui-slate">{helperText}</Text>
      ) : null}

      {errorText ? (
        <Text className="text-ui-danger mt-2">{errorText}</Text>
      ) : null}
    </View>
  );
};

export default React.memo(RangeInput);
