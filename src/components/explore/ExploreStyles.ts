import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  discoveryContent: { flexGrow: 1, padding: 16 },
  avatar: { width: "100%", height: "100%" },
  profileCard: {
    marginBottom: 20,
    padding: 16,
    flexShrink: 0,
  },
  profileHeader: {
    columnGap: 16,
  },
  avatarFrame: {
    width: 104,
    height: 116,
    flexShrink: 0,
    position: "relative",
  },
  avatarClip: {
    width: 104,
    height: 116,
    overflow: "hidden",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  profileDetails: {
    rowGap: 10,
    paddingTop: 4,
  },
  cardBody: {
    rowGap: 16,
  },
  matchNote: {
    columnGap: 12,
    borderLeftWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  bouquet: { width: 48, height: 48 },
});

export default styles;
