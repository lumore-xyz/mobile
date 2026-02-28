import type { NsfwClassName, NsfwClassification, NsfwPrediction } from "../service/providers/NsfwProvider";
import { useNsfw } from "./useNsfw";

export type { NsfwClassName, NsfwClassification, NsfwPrediction };

// Deprecated: use useNsfw() directly for new code.
export type UseNsfwDetectionOptions = {
  modelJson?: unknown;
  modelWeights?: unknown;
  inputSize?: number;
  topK?: number;
  threshold?: number;
};

export const useNsfwDetection = (_options?: UseNsfwDetectionOptions) => {
  const { classifyImage, clearError, error, isClassifying, isReady, status } =
    useNsfw();

  return {
    classifyImage,
    clearError,
    error,
    isModelLoading: status === "loading",
    isClassifying,
    isReady,
  };
};
