import { DEFAULT_WAVEFORM_BAR_COUNT, normalizeWaveformSamples } from "@/src/utils/audioWaveform";
import React, { useMemo } from "react";
import { View } from "react-native";

interface AudioWaveformProps {
  samples?: number[] | null;
  progress?: number;
  seed?: string;
  barCount?: number;
  height?: number;
  barWidth?: number;
  gap?: number;
  activeColor?: string;
  inactiveColor?: string;
}

export const AudioWaveform = React.memo(function AudioWaveform({
  samples,
  progress = 0,
  seed = "voice-note",
  barCount = DEFAULT_WAVEFORM_BAR_COUNT,
  height = 42,
  barWidth = 3,
  gap = 4,
  activeColor = "#FFFFFF",
  inactiveColor = "rgba(255,255,255,0.45)",
}: AudioWaveformProps) {
  const bars = useMemo(
    () => normalizeWaveformSamples(samples, barCount, seed),
    [barCount, samples, seed],
  );
  const safeProgress = Math.min(1, Math.max(0, progress));
  const activeCutoff = safeProgress * Math.max(0, bars.length - 1);
  const minBarHeight = Math.max(6, height * 0.16);

  return (
    <View
      className="flex-row items-center"
      style={{ height, gap }}
      accessibilityRole="image"
      accessibilityLabel="Voice note waveform"
    >
      {bars.map((value, index) => {
        const barHeight = minBarHeight + value * (height - minBarHeight);
        const isActive = safeProgress > 0 && index <= activeCutoff;

        return (
          <View
            key={`${index}-${value.toFixed(2)}`}
            className="rounded-full"
            style={{
              width: barWidth,
              height: barHeight,
              backgroundColor: isActive ? activeColor : inactiveColor,
            }}
          />
        );
      })}
    </View>
  );
});
