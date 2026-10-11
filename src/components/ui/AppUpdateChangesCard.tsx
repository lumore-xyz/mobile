import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const WHATS_NEW = [
  "Performance improvements",
  "Bug fixes and stability enhancements",
  "Better match suggestions",
];

const AppUpdateChangesCard = () => (
  <View style={styles.card}>
    <View style={styles.headingRow}>
      <Icon name="Sparkle" size={22} color={COLORS.forest} />
      <Text style={styles.heading}>What&apos;s new?</Text>
    </View>

    {WHATS_NEW.map((item) => (
      <View key={item} style={styles.changeRow}>
        <Icon name="CircleCheck" size={17} color={COLORS.forest} />
        <Text style={styles.changeText}>{item}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: `${COLORS.forest}26`,
    borderRadius: 18,
    backgroundColor: `${COLORS.forest}0A`,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 7,
  },
  heading: {
    color: COLORS.forest,
    fontSize: 16,
    fontWeight: "800",
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginTop: 5,
  },
  changeText: {
    flex: 1,
    color: COLORS.midnight,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default AppUpdateChangesCard;
