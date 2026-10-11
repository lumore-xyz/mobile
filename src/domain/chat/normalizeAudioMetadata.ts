interface AudioMetadata {
  audioDurationMs: number | null;
  audioWaveform: number[] | null;
}

export default function normalizeAudioMetadata(
  durationMs: number | string | null | undefined,
  waveform: unknown[] | null | undefined,
): AudioMetadata {
  return {
    audioDurationMs: Number(durationMs || 0) || null,
    audioWaveform: Array.isArray(waveform)
      ? waveform.map(Number).filter(Number.isFinite)
      : null,
  };
}
