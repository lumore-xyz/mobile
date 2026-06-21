import type { LucideIcon } from "lucide-react-native";
import * as LucideIcons from "lucide-react-native";

export const toLucideIconName = (componentName: string) =>
  componentName
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Za-z])([0-9])/g, (_match, letter, digit) =>
      letter === "x" ? `${letter}${digit}` : `${letter}-${digit}`,
    )
    .replace(/([0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();

const lucideIconMap = new Map<string, LucideIcon>();

for (const [exportName, component] of Object.entries(LucideIcons)) {
  const isIconExport =
    /^[A-Z]/.test(exportName) &&
    exportName !== "Icon" &&
    !exportName.startsWith("Lucide") &&
    !exportName.endsWith("Icon");

  if (!isIconExport) continue;
  lucideIconMap.set(
    toLucideIconName(exportName),
    component as LucideIcon,
  );
}

const canonicalNameAliases: Record<string, string> = {
  "arrow-down-0-1": "arrow-down-01",
  "arrow-down-1-0": "arrow-down-10",
  "arrow-down-a-z": "arrow-down-az",
  "arrow-down-z-a": "arrow-down-za",
  "arrow-up-0-1": "arrow-up-01",
  "arrow-up-1-0": "arrow-up-10",
  "arrow-up-a-z": "arrow-up-az",
  "arrow-up-z-a": "arrow-up-za",
};

for (const [canonicalName, exportedName] of Object.entries(
  canonicalNameAliases,
)) {
  const component = lucideIconMap.get(exportedName);
  if (component) lucideIconMap.set(canonicalName, component);
}

export const getLucideOptionIcon = (name: string): LucideIcon | null =>
  lucideIconMap.get(name) || null;

export const isKnownOptionIconName = (
  library: string | null | undefined,
  name: string | null | undefined,
): boolean =>
  library === "Lucide" && Boolean(name) && lucideIconMap.has(String(name));
