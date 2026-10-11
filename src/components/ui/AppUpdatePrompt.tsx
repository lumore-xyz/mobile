import AppUpdateActions from "@/src/components/ui/AppUpdateActions";
import AppUpdateChangesCard from "@/src/components/ui/AppUpdateChangesCard";
import AppUpdateVersionsCard from "@/src/components/ui/AppUpdateVersionsCard";
import { COLORS } from "@/src/libs/constants/theme";
import { useEffect, useState } from "react";
import UPDATE_HERO from "@/assets/images/app-update-hero.webp";
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useAppUpdate } from "../../hooks/useAppUpdate";

type Props = {
  /**
   * Set to false to temporarily disable the modal (e.g. during testing).
   * Defaults to true.
   */
  enabled?: boolean;
};

const DEFAULT_UPDATE_MESSAGE =
  "A new version of the app is available. Please update for the best experience.";

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

  const visible =
    enabled && (status === "force" || (status === "optional" && !dismissed));

  const openStore = async () => {
    if (!storeUrl) {
      await refresh();
      return;
    }

    try {
      await Linking.openURL(storeUrl);
    } catch {
      // The user can retry from the modal if the store does not open.
    }
  };

  const onLater = () => {
    if (status === "force") return;
    setDismissed(true);
  };

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
                source={UPDATE_HERO}
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

            <AppUpdateVersionsCard
              currentVersion={currentVersion}
              latestVersion={latestVersion}
            />
            <AppUpdateChangesCard />
            <AppUpdateActions
              isForce={isForce}
              onUpdate={() => void openStore()}
              onLater={onLater}
            />
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
    backgroundColor: `${COLORS.ink}B8`,
  },
  card: {
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: COLORS.paper,
    shadowColor: COLORS.midnight,
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
    color: COLORS.midnight,
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.7,
    textAlign: "center",
  },
  message: {
    alignSelf: "center",
    maxWidth: 350,
    marginTop: 10,
    color: COLORS.slate,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  brandName: {
    color: COLORS.forest,
    fontWeight: "700",
  },
});

export default AppUpdatePrompt;
