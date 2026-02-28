import * as tf from "@tensorflow/tfjs";
import {
  bundleResourceIO,
  decodeJpeg,
  fetch as tfFetch,
} from "@tensorflow/tfjs-react-native";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import RNFS from "react-native-fs";
import defaultModelJson from "../../../assets/nsfw_model/model.json";
import defaultModelWeightShard1 from "../../../assets/nsfw_model/group1-shard1of6.bin";
import defaultModelWeightShard2 from "../../../assets/nsfw_model/group1-shard2of6.bin";
import defaultModelWeightShard3 from "../../../assets/nsfw_model/group1-shard3of6.bin";
import defaultModelWeightShard4 from "../../../assets/nsfw_model/group1-shard4of6.bin";
import defaultModelWeightShard5 from "../../../assets/nsfw_model/group1-shard5of6.bin";
import defaultModelWeightShard6 from "../../../assets/nsfw_model/group1-shard6of6.bin";

const NSFW_THRESHOLD = 0.6;
const NSFW_CLASSES = {
  0: "Drawing",
  1: "Hentai",
  2: "Neutral",
  3: "Porn",
  4: "Sexy",
} as const;
const NSFW_UNAVAILABLE_MESSAGE =
  "Image safety check is temporarily unavailable. Please try again.";
const NSFW_DETECTED_MESSAGE =
  "NSFW content detected. Please choose a different image.";
const NSFW_SCAN_FAILED_MESSAGE =
  "Unable to scan selected image. Please choose a different image.";
const MODEL_INPUT_SIZE = 299;
const DEFAULT_TOP_K = 5;
const MODEL_JSON = defaultModelJson as tf.io.ModelJSON;
const MODEL_WEIGHTS = [
  defaultModelWeightShard1 as number,
  defaultModelWeightShard2 as number,
  defaultModelWeightShard3 as number,
  defaultModelWeightShard4 as number,
  defaultModelWeightShard5 as number,
  defaultModelWeightShard6 as number,
];

export type NsfwStatus = "loading" | "ready" | "error";
export type NsfwClassName = (typeof NSFW_CLASSES)[keyof typeof NSFW_CLASSES];

export type NsfwPrediction = {
  classIndex: number;
  className: NsfwClassName;
  probability: number;
};

export type NsfwClassification = {
  predictions: NsfwPrediction[];
  topPrediction: NsfwPrediction | null;
  nsfwScore: number;
  safeScore: number;
  isNsfw: boolean;
};

export type NsfwContextType = {
  classifyImage: (imageUri: string) => Promise<NsfwClassification>;
  assertImageIsSafe: (imageUri: string) => Promise<void>;
  clearError: () => void;
  isReady: boolean;
  isClassifying: boolean;
  status: NsfwStatus;
  error: string | null;
};

export const NsfwContext = createContext<NsfwContextType | undefined>(undefined);

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to classify image.";
};

const toScanMessage = (message: string) => {
  const normalizedMessage = message.toLowerCase();
  const isInvalidImageError =
    normalizedMessage.includes("valid jpeg image") ||
    normalizedMessage.includes("unsupported image type");

  if (isInvalidImageError) {
    return NSFW_SCAN_FAILED_MESSAGE;
  }

  return message;
};

const imageUriToTensor = async (
  imageUri: string,
  inputSize: number,
): Promise<tf.Tensor4D> => {
  let imageData: Uint8Array;

  try {
    const response = await tfFetch(imageUri, {}, { isBinary: true });
    const imageDataArrayBuffer = await response.arrayBuffer();
    imageData = new Uint8Array(imageDataArrayBuffer);
  } catch {
    const filePath = imageUri.startsWith("file://")
      ? imageUri.replace("file://", "")
      : imageUri;
    const imageBase64 = await RNFS.readFile(filePath, "base64");
    imageData = tf.util.encodeString(imageBase64, "base64");
  }

  return tf.tidy(() => {
    const decodedImage = decodeJpeg(imageData, 3);
    const resizedImage = tf.image.resizeBilinear(
      decodedImage,
      [inputSize, inputSize],
      true,
    );
    const normalizedImage = resizedImage.toFloat().div(255);

    return normalizedImage.expandDims(0) as tf.Tensor4D;
  });
};

const getTopPredictions = (
  probabilities: ArrayLike<number>,
  topK: number,
): NsfwPrediction[] => {
  const topPredictions: NsfwPrediction[] = [];

  for (let index = 0; index < probabilities.length; index += 1) {
    const className = NSFW_CLASSES[index as keyof typeof NSFW_CLASSES];
    if (!className) continue;

    topPredictions.push({
      classIndex: index,
      className,
      probability: Number(probabilities[index]),
    });
  }

  topPredictions.sort((first, second) => second.probability - first.probability);

  return topPredictions.slice(0, topK);
};

const getSafetyScores = (probabilities: ArrayLike<number>) => {
  const nsfwScore = Math.max(
    Number(probabilities[1] ?? 0),
    Number(probabilities[3] ?? 0),
    Number(probabilities[4] ?? 0),
  );

  const safeScore = Math.max(
    Number(probabilities[0] ?? 0),
    Number(probabilities[2] ?? 0),
  );

  return { nsfwScore, safeScore };
};

export const NsfwProvider = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<NsfwStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const modelRef = useRef<tf.LayersModel | null>(null);
  const loadPromiseRef = useRef<Promise<tf.LayersModel> | null>(null);
  const isMountedRef = useRef(true);
  const inFlightRef = useRef(0);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const loadModel = useCallback(async (): Promise<tf.LayersModel> => {
    if (modelRef.current) {
      return modelRef.current;
    }
    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }
    if (status === "error") {
      throw new Error(NSFW_UNAVAILABLE_MESSAGE);
    }

    setStatus("loading");
    setError(null);

    const loadPromise = (async () => {
      try {
        await tf.ready();

        const loadedModel = await tf.loadLayersModel(
          bundleResourceIO(MODEL_JSON, MODEL_WEIGHTS),
        );

        if (!isMountedRef.current) {
          loadedModel.dispose();
          throw new Error(NSFW_UNAVAILABLE_MESSAGE);
        }

        modelRef.current?.dispose();
        modelRef.current = loadedModel;
        setStatus("ready");

        return loadedModel;
      } catch (loadError) {
        const message = getErrorMessage(loadError);
        if (isMountedRef.current) {
          setStatus("error");
          setError(message);
        }
        throw loadError;
      } finally {
        loadPromiseRef.current = null;
      }
    })();

    loadPromiseRef.current = loadPromise;
    return loadPromise;
  }, [status]);

  useEffect(() => {
    void loadModel().catch(() => {});
  }, [loadModel]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      loadPromiseRef.current = null;
      modelRef.current?.dispose();
      modelRef.current = null;
    };
  }, []);

  const ensureReadyModel = useCallback(async () => {
    if (modelRef.current) {
      return modelRef.current;
    }

    if (status === "error" && !loadPromiseRef.current) {
      throw new Error(NSFW_UNAVAILABLE_MESSAGE);
    }

    try {
      return await loadModel();
    } catch {
      throw new Error(NSFW_UNAVAILABLE_MESSAGE);
    }
  }, [loadModel, status]);

  const classifyImage = useCallback(
    async (imageUri: string): Promise<NsfwClassification> => {
      if (!imageUri) {
        throw new Error("Image URI is required.");
      }

      const model = await ensureReadyModel();

      inFlightRef.current += 1;
      setIsClassifying(true);
      setError(null);

      let imageTensor: tf.Tensor4D | null = null;
      let modelOutput: tf.Tensor | tf.Tensor[] | null = null;

      try {
        imageTensor = await imageUriToTensor(imageUri, MODEL_INPUT_SIZE);
        modelOutput = model.predict(imageTensor) as tf.Tensor | tf.Tensor[];

        const outputTensor = Array.isArray(modelOutput)
          ? modelOutput[0]
          : modelOutput;

        const probabilities = await outputTensor.data();
        const predictions = getTopPredictions(probabilities, DEFAULT_TOP_K);
        const { nsfwScore, safeScore } = getSafetyScores(probabilities);

        return {
          predictions,
          topPrediction: predictions[0] ?? null,
          nsfwScore,
          safeScore,
          isNsfw: nsfwScore >= NSFW_THRESHOLD,
        };
      } catch (classifyError) {
        const message = toScanMessage(getErrorMessage(classifyError));
        setError(message);
        throw new Error(message);
      } finally {
        if (Array.isArray(modelOutput)) {
          modelOutput.forEach((tensor) => tensor.dispose());
        } else {
          modelOutput?.dispose();
        }
        imageTensor?.dispose();

        inFlightRef.current = Math.max(0, inFlightRef.current - 1);
        if (inFlightRef.current === 0) {
          setIsClassifying(false);
        }
      }
    },
    [ensureReadyModel],
  );

  const assertImageIsSafe = useCallback(
    async (imageUri: string) => {
      const classification = await classifyImage(imageUri);

      if (classification.isNsfw) {
        throw new Error(NSFW_DETECTED_MESSAGE);
      }
    },
    [classifyImage],
  );

  const contextValue = useMemo<NsfwContextType>(
    () => ({
      classifyImage,
      assertImageIsSafe,
      clearError,
      isReady: status === "ready",
      isClassifying,
      status,
      error,
    }),
    [assertImageIsSafe, classifyImage, clearError, error, isClassifying, status],
  );

  return <NsfwContext.Provider value={contextValue}>{children}</NsfwContext.Provider>;
};
