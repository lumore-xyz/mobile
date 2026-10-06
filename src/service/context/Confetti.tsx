import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { PALETTE } from "@/src/libs/constants/theme";

const { width, height } = Dimensions.get("window");

const COLORS = [PALETTE.forest, PALETTE.champagne, PALETTE.aubergine];

type Burst = {
  key: string;
  side: "left" | "right";
};

type ConfettiContextType = {
  fireSideCannons: (duration?: number) => void;
};

export const ConfettiContext = createContext<ConfettiContextType | null>(null);

export function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createBurst = useCallback((side: Burst["side"]): Burst => {
    const nextId = idRef.current++;
    return {
      key: `${Date.now()}-${nextId}-${side}`,
      side,
    };
  }, []);

  const fireSideCannons = useCallback((duration = 1200) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setBursts([createBurst("left"), createBurst("right")]);
    timerRef.current = setTimeout(() => setBursts([]), duration);
  }, [createBurst]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <ConfettiContext.Provider value={{ fireSideCannons }}>
      {children}

      {bursts.map((burst) => {
        const isLeft = burst.side === "left";
        return (
          <ConfettiCannon
            key={burst.key}
            count={10}
            origin={{
              x: isLeft ? 0 : width,
              y: height / 2,
            }}
            explosionSpeed={350}
            fallSpeed={1600}
            fadeOut
            autoStart
            colors={COLORS}
          />
        );
      })}
    </ConfettiContext.Provider>
  );
}
