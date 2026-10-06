// components/SingleSlider.tsx
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import React, { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";
import { COLORS } from "@/src/libs/constants/theme";

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
  const clampValue = useCallback(
    (nextValue: number) => {
      if (!Number.isFinite(nextValue)) return min;
      return Math.min(max, Math.max(min, nextValue));
    },
    [max, min],
  );

  const [sliderValue, setSliderValue] = useState(clampValue(value));

  useEffect(() => {
    setSliderValue(clampValue(value));
  }, [clampValue, value]);

  const handleValueChange = useCallback(
    (values: number[]) => {
      const nextValue = clampValue(values[0]);
      setSliderValue(nextValue);
      onChange(nextValue);
    },
    [clampValue, onChange],
  );

  return (
    <View className="rounded-2xl border border-ui-parchment bg-ui-paper px-5 py-4">
      {/* Label */}
        <Text className="mb-2 text-base font-semibold text-ui-ink">
        {label}
      </Text>

      {/* Current Value */}
        <Text className="mb-3 text-base text-ui-slate">
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
          backgroundColor: COLORS.forest,
        }}
        selectedStyle={{ backgroundColor: COLORS.forest, height: 2 }}
        unselectedStyle={{ backgroundColor: `${COLORS.ink}60`, height: 2 }}
      />

      {/* Helper & Error Text */}
      {helperText ? (
        <Text className="mt-2 text-sm text-ui-slate">{helperText}</Text>
      ) : null}

      {errorText ? (
        <Text className="text-ui-danger mt-2">{errorText}</Text>
      ) : null}
    </View>
  );
};

export default React.memo(SingleSlider);
