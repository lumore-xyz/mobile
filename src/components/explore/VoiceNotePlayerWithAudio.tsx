import { AudioWaveform } from "@/src/components/explore/AudioWaveform";
import formatAudioDuration from "@/src/components/explore/formatAudioDuration";
import { getExpoAudioModule } from "@/src/libs/audio";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface VoiceNotePlayerWithAudioProps {
  audioUrl: string;
  durationMs: number;
  waveform?: number[] | null;
  isOwnMessage: boolean;
  expoAudio: NonNullable<ReturnType<typeof getExpoAudioModule>>;
}

const VoiceNotePlayerWithAudio = React.memo(function VoiceNotePlayerWithAudio({
  audioUrl,
  durationMs,
  waveform,
  isOwnMessage,
  expoAudio,
}: VoiceNotePlayerWithAudioProps) {
  const player = expoAudio.useAudioPlayer(audioUrl, { updateInterval: 250 });
  const status = expoAudio.useAudioPlayerStatus(player);
  const durationSeconds =
    status.duration > 0 ? status.duration : Math.max(0, durationMs / 1000);
  const currentSeconds = Math.min(
    status.currentTime || 0,
    durationSeconds || status.currentTime || 0,
  );
  const progress =
    durationSeconds > 0
      ? Math.min(1, Math.max(0, currentSeconds / durationSeconds))
      : 0;

  const togglePlayback = () => {
    triggerSelectionHaptic();
    if (status.playing) {
      player.pause();
      return;
    }

    if (
      status.didJustFinish ||
      (durationSeconds > 0 && currentSeconds >= durationSeconds - 0.2)
    ) {
      void player
        .seekTo(0)
        .then(() => player.play())
        .catch(() => player.play());
      return;
    }

    player.play();
  };

  return (
    <View className="w-60 pe-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={togglePlayback}
          className={`h-11 w-11 items-center justify-center rounded-full active:opacity-75 ${
            isOwnMessage ? "bg-ui-paper/20" : "bg-ui-forest"
          }`}
          accessibilityRole="button"
          accessibilityLabel={
            status.playing ? "Pause voice note" : "Play voice note"
          }
        >
          <Icon
            name={status.playing ? "Pause" : "Play"}
            size={18}
            color="white"
          />
        </Pressable>

        <View className="flex-1">
          <AudioWaveform
            samples={waveform}
            progress={progress}
            seed={audioUrl}
            height={42}
            barCount={23}
            barWidth={3}
            gap={4}
            activeColor={isOwnMessage ? COLORS.paper : COLORS.forest}
            inactiveColor={
              isOwnMessage ? `${COLORS.paper}6B` : `${COLORS.forest}42`
            }
          />
        </View>
      </View>
      <Text
        className={`mt-2 text-xs ${
          isOwnMessage ? "text-ui-paper/85" : "text-ui-ink/70"
        }`}
      >
        {formatAudioDuration(durationMs, durationSeconds)}
      </Text>
    </View>
  );
});

export default VoiceNotePlayerWithAudio;
