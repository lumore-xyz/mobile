import Icon from "@/src/libs/Icon";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useAppUpdate } from "../../hooks/useAppUpdate";

type Props = {
  /**
   * Set to false to temporarily disable the modal (e.g. during testing).
   * Defaults to true.
   */
  enabled?: boolean;
};

const WHATS_NEW = [
  "Performance improvements",
  "Bug fixes and stability enhancements",
  "Better match suggestions",
];

const DEFAULT_UPDATE_MESSAGE =
  "A new version of the app is available. Please update for the best experience.";

const UpdateButtonGradient = () => (
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
        <Stop offset="0" stopColor="#5120AE" />
        <Stop offset="1" stopColor="#7C3CE3" />
      </LinearGradient>
    </Defs>
    <Rect width={100} height={54} fill="url(#updateGradient)" />
  </Svg>
);

const AppUpdatePrompt = ({ enabled = true }: Props) => {
  const {
    status,
    currentVersion,
    latestVersion,
    storeUrl,
    updateTitle,
    updateMessage,
    refresh,
  } = useAppUpdate();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (status === "force") {
      setDismissed(false);
    }
  }, [status]);

  const visible = useMemo(() => {
    if (!enabled) return false;
    if (status === "force") return true;
    if (status === "optional" && !dismissed) return true;
    return false;
  }, [enabled, status, dismissed]);

  const openStore = useCallback(async () => {
    if (!storeUrl) {
      await refresh();
      return;
    }

    try {
      await Linking.openURL(storeUrl);
    } catch {
      // The user can retry from the modal if the store does not open.
    }
  }, [storeUrl, refresh]);

  const onLater = useCallback(() => {
    if (status === "force") return;
    setDismissed(true);
  }, [status]);

  if (!visible) return null;

  const isForce = status === "force";
  const cardWidth = Math.min(screenWidth - 32, 430);
  const compact = screenHeight < 760;
  const displayTitle =
    updateTitle?.trim().toLowerCase() === "update available"
      ? "Update Available!"
      : updateTitle || "Update Available!";
  const hasCustomMessage =
    Boolean(updateMessage) && updateMessage !== DEFAULT_UPDATE_MESSAGE;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onLater}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              width: cardWidth,
              maxHeight: screenHeight - (compact ? 24 : 48),
            },
          ]}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              compact && styles.compactContent,
            ]}
          >
            <View
              style={[
                styles.heroViewport,
                compact && styles.compactHeroViewport,
              ]}
            >
              <Image
                accessibilityIgnoresInvertColors
                source={require("../../../assets/images/app-update-hero.png")}
                resizeMode="contain"
                style={[styles.heroImage, compact && styles.compactHeroImage]}
              />
            </View>

            <View style={styles.titleRow}>
              <Text style={styles.title}>{displayTitle}</Text>
            </View>

            {hasCustomMessage ? (
              <Text style={styles.message}>{updateMessage}</Text>
            ) : (
              <Text style={styles.message}>
                A new version of <Text style={styles.brandName}>Lumore</Text> is
                here with improvements and bug fixes to give you the best
                experience.
              </Text>
            )}

            <View style={styles.versionCard}>
              <View style={styles.versionIcon}>
                <Icon
                  name="Download"
                  size={27}
                  color="#6137BE"
                />
              </View>

              <View style={styles.versionColumn}>
                <Text style={styles.versionLabel}>Installed Version</Text>
                <Text style={styles.versionValue}>{currentVersion || "—"}</Text>
              </View>

              <View style={styles.versionDivider} />

              <View style={styles.versionColumn}>
                <Text style={styles.versionLabel}>Latest Version</Text>
                <View style={styles.latestVersionRow}>
                  <Text style={styles.versionValue}>
                    {latestVersion || "—"}
                  </Text>
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.changesCard}>
              <View style={styles.changesHeadingRow}>
                <Icon name="Sparkle" size={22} color="#633CB8" />
                <Text style={styles.changesHeading}>What&apos;s new?</Text>
              </View>

              {WHATS_NEW.map((item) => (
                <View key={item} style={styles.changeRow}>
                  <Icon name="CircleCheck" size={17} color="#633CB8" />
                  <Text style={styles.changeText}>{item}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Update Lumore now"
              activeOpacity={0.84}
              onPress={() => {
                void openStore();
              }}
              style={styles.updateButton}
            >
              <UpdateButtonGradient />
              <Text style={styles.updateButtonText}>Update Now 🚀</Text>
            </TouchableOpacity>

            {!isForce ? (
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.72}
                onPress={onLater}
                style={styles.laterButton}
              >
                <Text style={styles.laterButtonText}>Later</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "rgba(10, 9, 16, 0.72)",
  },
  card: {
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "#FFFBF7",
    shadowColor: "#100724",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 30,
    elevation: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  compactContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#EEEAE7",
  },
  heroViewport: {
    height: 244,
    alignItems: "center",
    overflow: "hidden",
  },
  compactHeroViewport: {
    height: 192,
  },
  heroImage: {
    position: "absolute",
    top: 0,
    width: 250,
    height: 250,
  },
  compactHeroImage: {
    top: -43,
    width: 248,
    height: 296,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  title: {
    flexShrink: 1,
    color: "#251551",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.7,
    textAlign: "center",
  },
  goldAccent: {
    marginRight: 10,
    color: "#D9A536",
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 38,
    transform: [{ rotate: "-35deg" }],
  },
  rightAccent: {
    marginRight: 0,
    marginLeft: 10,
    transform: [{ rotate: "35deg" }],
  },
  message: {
    alignSelf: "center",
    maxWidth: 350,
    marginTop: 10,
    color: "#66646E",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  brandName: {
    color: "#7140CB",
    fontWeight: "700",
  },
  versionCard: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E7E0DB",
    borderRadius: 18,
    backgroundColor: "#FFFCF9",
    shadowColor: "#6A4C2E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  versionIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderRadius: 14,
    backgroundColor: "#F1E8FF",
  },
  versionColumn: {
    flex: 1,
    minWidth: 0,
  },
  versionLabel: {
    color: "#68636D",
    fontSize: 12,
    lineHeight: 17,
  },
  versionValue: {
    color: "#201345",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },
  versionDivider: {
    width: 1,
    height: 44,
    marginHorizontal: 14,
    backgroundColor: "#DFD8D4",
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
    backgroundColor: "#E4F2D7",
  },
  newBadgeText: {
    color: "#4D8B39",
    fontSize: 10,
    fontWeight: "800",
  },
  changesCard: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#E3D5FF",
    borderRadius: 18,
    backgroundColor: "#F8F3FF",
  },
  changesHeadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 7,
  },
  changesHeading: {
    color: "#6039B5",
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
    color: "#363044",
    fontSize: 13,
    lineHeight: 18,
  },
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
    color: "#FFFFFF",
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
    borderColor: "#6B35CF",
    borderRadius: 16,
    backgroundColor: "#FFFBF7",
  },
  laterButtonText: {
    color: "#6330C4",
    fontSize: 16,
    fontWeight: "700",
  },
});

export default AppUpdatePrompt;
