import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

const runHaptic = (action: () => Promise<void>) => {
  if (Platform.OS === "web") return;
  void action().catch(() => {});
};

export const triggerSelectionHaptic = () => {
  runHaptic(() => Haptics.selectionAsync());
};

export const triggerLightImpactHaptic = () => {
  runHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
};

export const triggerSuccessHaptic = () => {
  runHaptic(() =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  );
};
