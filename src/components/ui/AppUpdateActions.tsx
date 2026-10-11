import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const AppUpdateActions = ({
  isForce,
  onUpdate,
  onLater,
}: {
  isForce: boolean;
  onUpdate: () => void;
  onLater: () => void;
}) => (
  <>
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Update Lumore now"
      onPress={onUpdate}
      style={({ pressed }) => [styles.updateButton, pressed && styles.pressed]}
    >
      <Svg
        pointerEvents="none"
        width="100%"
        height="100%"
        viewBox="0 0 100 54"
        preserveAspectRatio="none"
        style={StyleSheet.absoluteFillObject}
      >
        <Defs>
          <LinearGradient id="updateGradient" x1="0" x2="1" y1="0" y2="0">
            <Stop offset="0" stopColor={COLORS.forest} />
            <Stop offset="1" stopColor={COLORS.midnight} />
          </LinearGradient>
        </Defs>
        <Rect width={100} height={54} fill="url(#updateGradient)" />
      </Svg>
      <Text style={styles.updateButtonText}>Update Now 🚀</Text>
    </Pressable>

    {!isForce ? (
      <Pressable
        accessibilityRole="button"
        onPress={onLater}
        style={({ pressed }) => [styles.laterButton, pressed && styles.laterPressed]}
      >
        <Text style={styles.laterButtonText}>Later</Text>
      </Pressable>
    ) : null}
  </>
);

const styles = StyleSheet.create({
  updateButton: {
    position: "relative",
    flexShrink: 0,
    alignSelf: "stretch",
    width: "100%",
    height: 54,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginTop: 18,
    borderRadius: 16,
  },
  updateButtonText: {
    zIndex: 1,
    color: COLORS.paper,
    fontSize: 17,
    fontWeight: "800",
  },
  laterButton: {
    flexShrink: 0,
    alignSelf: "stretch",
    width: "100%",
    height: 54,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: COLORS.forest,
    borderRadius: 16,
    backgroundColor: COLORS.paper,
  },
  laterButtonText: {
    color: COLORS.forest,
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: { opacity: 0.84 },
  laterPressed: { opacity: 0.72 },
});

export default AppUpdateActions;
