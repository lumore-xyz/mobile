const MIN_WAVEFORM_VALUE = 0.08;
const MAX_WAVEFORM_VALUE = 1;

export const DEFAULT_WAVEFORM_BAR_COUNT = 36;

const clampWaveformValue = (value: number) =>
  Math.min(MAX_WAVEFORM_VALUE, Math.max(MIN_WAVEFORM_VALUE, value));

const hashString = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
};

export const createFallbackWaveform = (
  seed: string,
  count = DEFAULT_WAVEFORM_BAR_COUNT,
) => {
  const hash = hashString(seed);
  return Array.from({ length: count }, (_, index) => {
    const wave =
      Math.sin(index * 0.55 + hash * 0.0003) * 0.32 +
      Math.sin(index * 0.19 + hash * 0.00007) * 0.2;
    const noise = ((hash >> (index % 16)) & 7) / 28;
    return clampWaveformValue(0.42 + wave + noise);
  });
};

export const normalizeWaveformSamples = (
  samples?: number[] | null,
  count = DEFAULT_WAVEFORM_BAR_COUNT,
  fallbackSeed = "voice-note",
) => {
  const validSamples = (samples || [])
    .map(Number)
    .filter((sample) => Number.isFinite(sample));

  if (!validSamples.length) {
    return createFallbackWaveform(fallbackSeed, count);
  }

  return Array.from({ length: count }, (_, index) => {
    const sourceIndex =
      count <= 1
        ? 0
        : Math.round((index / (count - 1)) * (validSamples.length - 1));
    return clampWaveformValue(validSamples[sourceIndex] || MIN_WAVEFORM_VALUE);
  });
};

export const createRecordingWaveformSample = (
  metering: number | undefined,
  index: number,
) => {
  if (typeof metering === "number" && Number.isFinite(metering)) {
    return clampWaveformValue((metering + 58) / 58);
  }

  const pulse =
    Math.sin(index * 0.9) * 0.26 + Math.sin(index * 0.31) * 0.18 + 0.52;
  return clampWaveformValue(pulse);
};
