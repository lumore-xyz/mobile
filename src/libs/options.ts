import { storage } from "@/src/service/storage";
import isRecord from "@/src/utils/isRecord";
import {
  bloodTypeOptions,
  dietOptions,
  drinkingOptions,
  genderOptions,
  interestedInOptions,
  interestOptions,
  languageOptions,
  maritalStatusOptions,
  personalityTypeOptions,
  petOptions,
  religionOptions,
  relationshipTypeOptions,
  smokingOptions,
  visibilityOptions,
  zodiacOptions,
  goalOptions,
} from "./optionsCatalog";
import type { SelectOption, SelectOptionIcon } from "./optionsCatalog";

const DYNAMIC_OPTIONS_CACHE_KEY = "lumore:dynamic-options";
const DYNAMIC_OPTIONS_VERSION_KEY = "lumore:dynamic-options-version";

const dynamicOptionRegistry = {
  languageOptions,
  genderOptions,
  interestedInOptions,
  goalOptions,
  bloodTypeOptions,
  interestOptions,
  dietOptions,
  zodiacOptions,
  drinkingOptions,
  smokingOptions,
  petOptions,
  maritalStatusOptions,
  personalityTypeOptions,
  religionOptions,
  relationshipTypeOptions,
  visibilityOptions,
} satisfies Record<string, SelectOption[]>;

type DynamicOptionKey = keyof typeof dynamicOptionRegistry;

export type DynamicOptionsPayload = Partial<
  Record<DynamicOptionKey, SelectOption[]>
>;

const isOptionIcon = (value: unknown): value is SelectOptionIcon =>
  isRecord(value) &&
  value.library === "Lucide" &&
  typeof value.name === "string";

const normalizeOptionIcon = (
  value: unknown,
): SelectOptionIcon | null | undefined => {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (!isOptionIcon(value)) return undefined;
  return { library: value.library, name: value.name };
};

const isOptionArray = (value: unknown): value is SelectOption[] =>
  Array.isArray(value) &&
  value.every(
    (option) =>
      isRecord(option) &&
      typeof option.label === "string" &&
      typeof option.value === "string" &&
      (option.icon === undefined ||
        option.icon === null ||
        isOptionIcon(option.icon)),
  );

const normalizeOptionArray = (options: SelectOption[]) => {
  const unique = new Map<string, SelectOption>();
  options.forEach((option) => {
    const value = option.value.trim();
    const label = option.label.trim();
    if (!value || !label) return;
    const icon = normalizeOptionIcon(option.icon);
    const entry: SelectOption = { value, label };
    if (icon) entry.icon = icon;
    unique.set(value, entry);
  });
  return Array.from(unique.values());
};

const replaceOptionsInPlace = (
  target: SelectOption[],
  next: SelectOption[],
) => {
  target.splice(0, target.length, ...next);
};

export const applyDynamicOptions = (payload: DynamicOptionsPayload) => {
  (Object.keys(dynamicOptionRegistry) as DynamicOptionKey[]).forEach((key) => {
    const next = payload[key];
    if (!isOptionArray(next)) return;
    const normalized = normalizeOptionArray(next);
    if (!normalized.length) return;
    replaceOptionsInPlace(dynamicOptionRegistry[key], normalized);
  });
};

export const saveDynamicOptionsToCache = (
  payload: DynamicOptionsPayload,
  version?: string,
) => {
  storage.set(DYNAMIC_OPTIONS_CACHE_KEY, JSON.stringify(payload));
  if (version) {
    storage.set(DYNAMIC_OPTIONS_VERSION_KEY, version);
  }
};

export const loadDynamicOptionsFromCache = (): DynamicOptionsPayload | null => {
  const raw = storage.getString(DYNAMIC_OPTIONS_CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DynamicOptionsPayload;
    applyDynamicOptions(parsed);
    return parsed;
  } catch {
    return null;
  }
};

export const getCachedOptionsVersion = () => {
  return storage.getString(DYNAMIC_OPTIONS_VERSION_KEY) || null;
};

export const setCachedOptionsVersion = (version: string) => {
  storage.set(DYNAMIC_OPTIONS_VERSION_KEY, version);
};
