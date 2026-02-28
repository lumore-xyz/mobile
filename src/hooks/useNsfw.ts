import { useContext } from "react";
import { NsfwContext } from "../service/providers/NsfwProvider";

export const useNsfw = () => {
  const context = useContext(NsfwContext);

  if (!context) {
    throw new Error("useNsfw must be used inside NsfwProvider");
  }

  return context;
};
