import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import mobileAds, {
  AdEventType,
  InterstitialAd,
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  type RewardedAdReward,
} from "react-native-google-mobile-ads";
import { ADMOB_INTERSTITIAL_UNIT_ID, ADMOB_REWARDED_UNIT_ID } from "../config";

interface AdContextType {
  isInitialized: boolean;
  isInterstitialLoaded: boolean;
  isRewardedLoaded: boolean;
  preloadInterstitial: () => void;
  preloadRewarded: () => void;
  showInterstitial: () => boolean;
  showRewarded: () => Promise<RewardedAdReward | null>;
}

export const AdContext = createContext<AdContextType | undefined>(undefined);

const interstitialUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : ADMOB_INTERSTITIAL_UNIT_ID;
const rewardedUnitId = __DEV__ ? TestIds.REWARDED : ADMOB_REWARDED_UNIT_ID;

export const AdProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInterstitialLoaded, setIsInterstitialLoaded] = useState(false);
  const [isRewardedLoaded, setIsRewardedLoaded] = useState(false);

  const rewardedResolverRef = useRef<((reward: RewardedAdReward | null) => void) | null>(null);
  const earnedRewardRef = useRef<RewardedAdReward | null>(null);

  const interstitial = useMemo(() => {
    if (!interstitialUnitId) return null;
    return InterstitialAd.createForAdRequest(interstitialUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
  }, []);

  const rewarded = useMemo(() => {
    if (!rewardedUnitId) return null;
    return RewardedAd.createForAdRequest(rewardedUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });
  }, []);

  const resolveRewardedPromise = useCallback((reward: RewardedAdReward | null) => {
    if (!rewardedResolverRef.current) return;
    const resolve = rewardedResolverRef.current;
    rewardedResolverRef.current = null;
    resolve(reward);
  }, []);

  const preloadInterstitial = useCallback(() => {
    if (!interstitial) return;
    interstitial.load();
  }, [interstitial]);

  const preloadRewarded = useCallback(() => {
    if (!rewarded) return;
    rewarded.load();
  }, [rewarded]);

  const showInterstitial = useCallback(() => {
    if (!interstitial) return false;
    if (!isInterstitialLoaded) {
      interstitial.load();
      return false;
    }

    try {
      interstitial.show();
      return true;
    } catch {
      interstitial.load();
      return false;
    }
  }, [interstitial, isInterstitialLoaded]);

  const showRewarded = useCallback(async () => {
    if (!rewarded) return null;
    if (!isRewardedLoaded) {
      rewarded.load();
      return null;
    }

    if (rewardedResolverRef.current) {
      rewardedResolverRef.current(null);
      rewardedResolverRef.current = null;
    }

    earnedRewardRef.current = null;

    return new Promise<RewardedAdReward | null>((resolve) => {
      rewardedResolverRef.current = resolve;

      try {
        rewarded.show();
      } catch {
        rewardedResolverRef.current = null;
        rewarded.load();
        resolve(null);
      }
    });
  }, [isRewardedLoaded, rewarded]);

  useEffect(() => {
    let isMounted = true;

    mobileAds()
      .initialize()
      .then(() => {
        if (!isMounted) return;
        setIsInitialized(true);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsInitialized(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!interstitial) return;

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setIsInterstitialLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setIsInterstitialLoaded(false);
      interstitial.load();
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      setIsInterstitialLoaded(false);
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [interstitial]);

  useEffect(() => {
    if (!rewarded) return;

    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        setIsRewardedLoaded(true);
      },
    );

    const unsubscribeEarnedReward = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        earnedRewardRef.current = reward;
      },
    );

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setIsRewardedLoaded(false);
      const reward = earnedRewardRef.current;
      earnedRewardRef.current = null;
      resolveRewardedPromise(reward);
      rewarded.load();
    });

    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, () => {
      setIsRewardedLoaded(false);
      earnedRewardRef.current = null;
      resolveRewardedPromise(null);
    });

    rewarded.load();

    return () => {
      resolveRewardedPromise(null);
      unsubscribeLoaded();
      unsubscribeEarnedReward();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [resolveRewardedPromise, rewarded]);

  const contextValue = useMemo<AdContextType>(
    () => ({
      isInitialized,
      isInterstitialLoaded,
      isRewardedLoaded,
      preloadInterstitial,
      preloadRewarded,
      showInterstitial,
      showRewarded,
    }),
    [
      isInitialized,
      isInterstitialLoaded,
      isRewardedLoaded,
      preloadInterstitial,
      preloadRewarded,
      showInterstitial,
      showRewarded,
    ],
  );

  return <AdContext.Provider value={contextValue}>{children}</AdContext.Provider>;
};
