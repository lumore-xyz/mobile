import { getExpoAudioModule } from "@/src/libs/audio";
import { socketDebug } from "@/src/service/socket-debug";
import {
  createRecordingWaveformSample,
  DEFAULT_WAVEFORM_BAR_COUNT,
  normalizeWaveformSamples,
} from "@/src/utils/audioWaveform";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";

const VOICE_NOTES_UNAVAILABLE_MESSAGE =
  "Voice notes aren’t available in this version of the app. Please update Lumore and try again.";
const MIN_VOICE_NOTE_DURATION_MS = 800;
const RECORDING_WAVEFORM_SAMPLE_LIMIT = 72;

interface RecordedVoiceNote {
  uri: string;
  durationMs: number;
  waveform: number[];
}

const useVoiceRecorder = (
  onError: (error: string | null) => void,
  roomId?: string | null,
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [waveform, setWaveform] = useState<number[]>([]);
  const recordingRef = useRef(false);
  const waveformRef = useRef<number[]>([]);
  const expoAudio = useMemo(() => getExpoAudioModule(), []);
  const recordingOptions = useMemo(
    () =>
      expoAudio
        ? { ...expoAudio.RecordingPresets.LOW_QUALITY, isMeteringEnabled: true }
        : null,
    [expoAudio],
  );
  const recorder =
    expoAudio && recordingOptions
      ? expoAudio.useAudioRecorder(recordingOptions)
      : null;
  const recorderState =
    expoAudio && recorder
      ? expoAudio.useAudioRecorderState(recorder, 250)
      : {
          isRecording: false,
          durationMillis: 0,
          metering: undefined,
          url: null,
        };

  useEffect(() => {
    if (!isRecording) return;
    setWaveform((previous) => {
      const sample = createRecordingWaveformSample(
        recorderState.metering,
        previous.length,
      );
      const next = [...previous, sample].slice(-RECORDING_WAVEFORM_SAMPLE_LIMIT);
      waveformRef.current = next;
      return next;
    });
  }, [isRecording, recorderState.durationMillis, recorderState.metering]);

  const stopRecording = useCallback(async () => {
    try {
      if (recorder && (recorderState.isRecording || recordingRef.current)) {
        await recorder.stop();
      }
    } catch (error) {
      console.error("[ChatScreen] Failed to stop voice recorder:", error);
    } finally {
      recordingRef.current = false;
      setIsRecording(false);
      void expoAudio
        ?.setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        })
        .catch(() => {});
    }
  }, [expoAudio, recorder, recorderState.isRecording]);

  const startRecording = useCallback(async () => {
    if (!expoAudio || !recorder) {
      Alert.alert("Voice notes unavailable", VOICE_NOTES_UNAVAILABLE_MESSAGE);
      return;
    }

    try {
      const permission = await expoAudio.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Microphone permission required",
          "Please enable microphone access to record voice notes.",
        );
        return;
      }

      onError(null);
      waveformRef.current = [];
      setWaveform([]);
      await expoAudio.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();
      recordingRef.current = true;
      setIsRecording(true);
      socketDebug("ChatScreen", "voice recording started", { roomId });
      return true;
    } catch (error) {
      console.error("[ChatScreen] Failed to start voice recording:", error);
      onError("Could not start voice recording. Please try again.");
      recordingRef.current = false;
      setIsRecording(false);
      void expoAudio
        ?.setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        })
        .catch(() => {});
      return false;
    }
  }, [expoAudio, onError, recorder, roomId]);

  const cancelRecording = useCallback(async () => {
    waveformRef.current = [];
    setWaveform([]);
    await stopRecording();
  }, [stopRecording]);

  const resetWaveform = useCallback(() => {
    waveformRef.current = [];
    setWaveform([]);
  }, []);

  const finishRecording = useCallback(async (): Promise<RecordedVoiceNote | null> => {
    if (!expoAudio || !recorder) {
      Alert.alert("Voice notes unavailable", VOICE_NOTES_UNAVAILABLE_MESSAGE);
      return null;
    }

    const durationMs = recorderState.durationMillis;
    const finalWaveform = normalizeWaveformSamples(
      waveformRef.current,
      DEFAULT_WAVEFORM_BAR_COUNT,
      `${roomId}-${durationMs}`,
    );

    try {
      await recorder.stop();
    } finally {
      recordingRef.current = false;
      setIsRecording(false);
      void expoAudio
        .setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        })
        .catch(() => {});
    }

    const uri = recorder.uri || recorderState.url;
    if (!uri) {
      onError("Voice recording failed. Please try again.");
      return null;
    }
    if (durationMs < MIN_VOICE_NOTE_DURATION_MS) {
      onError("Voice note is too short. Try recording a bit longer.");
      return null;
    }

    onError(null);
    return { uri, durationMs, waveform: finalWaveform };
  }, [expoAudio, onError, recorder, recorderState.durationMillis, recorderState.url, roomId]);

  useEffect(
    () => () => {
      if (recordingRef.current) {
        void recorder?.stop().catch(() => {});
      }
    },
    [recorder],
  );

  return {
    isRecording,
    recordingDurationMs: recorderState.durationMillis,
    waveform,
    startRecording,
    cancelRecording,
    finishRecording,
    stopRecording,
    resetWaveform,
  };
};

export default useVoiceRecorder;
