import { AudioWaveform } from "@/src/components/explore/AudioWaveform";
import formatAudioDuration from "@/src/components/explore/formatAudioDuration";
import { COLORS } from "@/src/libs/constants/theme";
import Icon from "@/src/libs/Icon";
import { triggerSelectionHaptic } from "@/src/utils/haptics";
import { Pressable, Text, View } from "react-native";

interface VoiceRecordingControlsProps {
  durationMs: number;
  waveform: number[];
  onCancel: () => void;
}

const VoiceRecordingControls = ({
  durationMs,
  waveform,
  onCancel,
}: VoiceRecordingControlsProps) => {
  return (
    <View className="mb-2 flex-row items-center gap-3 rounded-2xl bg-ui-forest px-3 py-2">
      <Pressable
        onPress={() => {
          triggerSelectionHaptic();
          onCancel();
        }}
        className="min-h-11 justify-center"
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Cancel voice recording"
      >
        <View className="h-11 w-11 items-center justify-center rounded-full bg-ui-paper">
          <Icon name="Trash" size={20} color={COLORS.forest} />
        </View>
      </Pressable>
      <View className="flex-1">
        <AudioWaveform
          samples={waveform}
          seed={`recording-${durationMs}`}
          barCount={42}
          height={38}
          barWidth={3}
          gap={4}
          activeColor={COLORS.paper}
          inactiveColor={`${COLORS.paper}E6`}
        />
      </View>
      <Text className="w-12 text-right text-base text-ui-paper">
        {formatAudioDuration(durationMs)}
      </Text>
    </View>
  );
};

export default VoiceRecordingControls;
