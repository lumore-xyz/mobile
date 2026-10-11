import { AudioWaveform } from "@/src/components/explore/AudioWaveform";
import VoiceNotePlayerWithAudio from "@/src/components/explore/VoiceNotePlayerWithAudio";
import formatAudioDuration from "@/src/components/explore/formatAudioDuration";
import { getExpoAudioModule } from "@/src/libs/audio";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import React, { useMemo } from "react";
import { Text, View } from "react-native";

interface VoiceNotePlayerProps {
  audioUrl: string;
  durationMs: number;
  waveform?: number[] | null;
  isOwnMessage: boolean;
}

const VoiceNotePlayer = React.memo(function VoiceNotePlayer({
  audioUrl,
  durationMs,
  waveform,
  isOwnMessage,
}: VoiceNotePlayerProps) {
  const expoAudio = useMemo(() => getExpoAudioModule(), []);

  if (!expoAudio) {
    return (
      <View className="w-60">
        <View className="flex-row items-center gap-3">
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${
              isOwnMessage ? "bg-ui-paper/20" : "bg-ui-forest/10"
            }`}
          >
            <Icon
              name="Mic"
              size={18}
              color={isOwnMessage ? COLORS.paper : COLORS.forest}
            />
          </View>
          <View className="flex-1">
            <AudioWaveform
              samples={waveform}
              seed={audioUrl}
              height={34}
              barCount={28}
              barWidth={3}
              gap={4}
              activeColor={isOwnMessage ? COLORS.paper : COLORS.forest}
              inactiveColor={
                isOwnMessage ? `${COLORS.paper}73` : `${COLORS.forest}40`
              }
            />
          </View>
          <Text
            className={`text-xs ${
              isOwnMessage ? "text-ui-paper/80" : "text-ui-ink/70"
            }`}
          >
            {formatAudioDuration(durationMs)}
          </Text>
        </View>
        <Text
          className={`mt-2 text-xs ${
            isOwnMessage ? "text-ui-paper/80" : "text-ui-ink/70"
          }`}
        >
          Update app to play
        </Text>
      </View>
    );
  }

  return (
    <VoiceNotePlayerWithAudio
      audioUrl={audioUrl}
      durationMs={durationMs}
      waveform={waveform}
      isOwnMessage={isOwnMessage}
      expoAudio={expoAudio}
    />
  );
});

export default VoiceNotePlayer;
