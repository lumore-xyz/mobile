import React from "react";
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardEvent,
  Platform,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface KeyboardDodgingViewProps {
  children: React.ReactNode;
}

export const KeyboardDodgingView = ({
  children,
}: KeyboardDodgingViewProps) => {
  const insets = useSafeAreaInsets();
  const containerRef = React.useRef<View>(null);
  const keyboardOffset = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    let measurementFrame: number | null = null;

    const animateOffset = (toValue: number, duration = 220) => {
      keyboardOffset.stopAnimation();
      Animated.timing(keyboardOffset, {
        toValue,
        duration: Math.max(duration, 120),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    };

    const handleKeyboardShow = (event: KeyboardEvent) => {
      measurementFrame = requestAnimationFrame(() => {
        containerRef.current?.measureInWindow((_x, y, _width, height) => {
          const containerBottom = y + height;
          const keyboardTop =
            event.endCoordinates.screenY -
            (Platform.OS === "android" ? insets.top : 0);
          const safeContentBottom = containerBottom - insets.bottom;
          const coveredHeight = Math.max(
            0,
            safeContentBottom - keyboardTop,
          );

          animateOffset(coveredHeight, event.duration);
        });
      });
    };

    const showSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillChangeFrame" : "keyboardDidShow",
      handleKeyboardShow,
    );
    const hideSubscription = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      (event: KeyboardEvent) => animateOffset(0, event.duration),
    );

    return () => {
      if (measurementFrame !== null) cancelAnimationFrame(measurementFrame);
      showSubscription.remove();
      hideSubscription.remove();
      keyboardOffset.stopAnimation();
    };
  }, [insets.bottom, insets.top, keyboardOffset]);

  return (
    <Animated.View
      ref={containerRef}
      collapsable={false}
      style={{ flex: 1, marginBottom: keyboardOffset }}
    >
      {children}
    </Animated.View>
  );
};
