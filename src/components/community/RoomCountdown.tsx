import React, { useEffect, useMemo, useState } from "react";
import { Text } from "react-native";
import formatRoomCountdown, {
  type RoomCountdownPrecision,
} from "@/src/features/community/formatRoomCountdown";

interface RoomCountdownProps {
  nextMatchAt?: string | null;
  fallbackSeconds?: number;
  precision?: RoomCountdownPrecision;
  className?: string;
}

export default function RoomCountdown({
  nextMatchAt,
  fallbackSeconds,
  precision = "seconds",
  className = "font-semibold text-ui-forest",
}: RoomCountdownProps) {
  const [now, setNow] = useState(Date.now);
  const fallbackDeadline = useMemo(
    () => Date.now() + Math.max(0, Number(fallbackSeconds || 0)) * 1000,
    [fallbackSeconds],
  );

  useEffect(() => {
    const intervalMs = precision === "seconds" ? 1000 : 30_000;
    const intervalId = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(intervalId);
  }, [precision]);

  const targetTime = nextMatchAt ? new Date(nextMatchAt).getTime() : Number.NaN;
  const deadline = Number.isFinite(targetTime) ? targetTime : fallbackDeadline;
  const remainingSeconds = Math.max(0, Math.ceil((deadline - now) / 1000));

  return (
    <Text className={className}>
      {formatRoomCountdown(remainingSeconds, precision)}
    </Text>
  );
}
