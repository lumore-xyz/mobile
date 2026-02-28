import React, {
  createContext,
  useCallback,
  useRef,
  useState,
} from "react";
import { Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

const { width, height } = Dimensions.get("window");

const COLORS = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];
const MAX_ACTIVE_BURSTS = 240;

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

  const createBurst = useCallback((side: Burst["side"]): Burst => {
    const nextId = idRef.current++;
    return {
      key: `${Date.now()}-${nextId}-${side}`,
      side,
    };
  }, []);

  const fireSideCannons = useCallback((duration = 3000) => {
    const endTime = Date.now() + duration;

    const frame = () => {
      if (Date.now() > endTime) return;

      setBursts((prev) => {
        const next = [...prev, createBurst("left"), createBurst("right")];
        if (next.length <= MAX_ACTIVE_BURSTS) return next;
        return next.slice(-MAX_ACTIVE_BURSTS);
      });

      requestAnimationFrame(frame);
    };

    frame();
  }, [createBurst]);

  return (
    <ConfettiContext.Provider value={{ fireSideCannons }}>
      {children}

      {bursts.map((burst) => {
        const isLeft = burst.side === "left";
        return (
          <ConfettiCannon
            key={burst.key}
            count={2}
            origin={{
              x: isLeft ? 0 : width,
              y: height / 2,
            }}
            explosionSpeed={600}
            fallSpeed={2500}
            fadeOut
            autoStart
            colors={COLORS}
          />
        );
      })}
    </ConfettiContext.Provider>
  );
}
