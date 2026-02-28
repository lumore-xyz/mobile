import { useContext } from "react";
import { ConfettiContext } from "../service/context/Confetti";

export function useConfetti() {
  const ctx = useContext(ConfettiContext);

  if (!ctx) {
    throw new Error("useConfetti must be used inside ConfettiProvider");
  }

  return ctx;
}
