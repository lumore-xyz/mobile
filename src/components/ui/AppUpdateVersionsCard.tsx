import Icon from "@/src/libs/Icon";
import { COLORS } from "@/src/libs/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const AppUpdateVersionsCard = ({
  currentVersion,
  latestVersion,
}: {
  currentVersion: string | null;
  latestVersion: string | null;
}) => (
  <View style={styles.card}>
    <View style={styles.icon}>
      <Icon name="Download" size={27} color={COLORS.forest} />
    </View>

    <View style={styles.versionColumn}>
      <Text style={styles.label}>Installed Version</Text>
      <Text style={styles.value}>{currentVersion || "—"}</Text>
    </View>

    <View style={styles.divider} />

    <View style={styles.versionColumn}>
      <Text style={styles.label}>Latest Version</Text>
      <View style={styles.latestVersionRow}>
        <Text style={styles.value}>{latestVersion || "—"}</Text>
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.parchment,
    borderRadius: 18,
    backgroundColor: COLORS.paper,
    shadowColor: COLORS.midnight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  icon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: `${COLORS.forest}10`,
  },
  versionColumn: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: COLORS.slate,
    fontSize: 12,
    lineHeight: 17,
  },
  value: {
    color: COLORS.midnight,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  divider: {
    width: 1,
    height: 44,
    marginHorizontal: 14,
    backgroundColor: COLORS.parchment,
  },
  latestVersionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: COLORS.champagne,
  },
  newBadgeText: {
    color: COLORS.ink,
    fontSize: 10,
    fontWeight: "800",
  },
});

export default AppUpdateVersionsCard;
