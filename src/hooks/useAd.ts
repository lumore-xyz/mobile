import { useContext } from "react";
import { AdContext } from "../service/providers/AdProvider";

export function useAd() {
  const context = useContext(AdContext);

  if (!context) {
    throw new Error("useAd must be used inside AdProvider");
  }

  return context;
}
