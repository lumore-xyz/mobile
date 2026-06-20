/**
 * Robust semver-style version comparison that does not rely on lexicographic
 * string comparisons. Accepts versions like:
 *   "1.0.0", "1.0.10", "1.2.3.4", "1.0.0-beta", "1.0.0+build.123"
 *
 * Returns:
 *   -1 if a < b
 *    0 if a == b
 *    1 if a > b
 *
 * Pre-release/build metadata is ignored when the core [major, minor, patch]
 * tuple is equal, so "1.0.0" and "1.0.0+build.1" are considered equal.
 */
type VersionSegments = {
  core: number[];
  preRelease: string[];
  build: string[];
};

const EMPTY_SEGMENTS: VersionSegments = { core: [], preRelease: [], build: [] };

const parseVersion = (raw: unknown): VersionSegments => {
  if (raw === null || raw === undefined) return EMPTY_SEGMENTS;

  const value = typeof raw === "string" ? raw : String(raw);
  const trimmed = value.trim();
  if (!trimmed) return EMPTY_SEGMENTS;

  const [mainPart, ...rest] = trimmed.split("+");
  const build = rest.length > 0 ? rest.join("+").split(".") : [];

  const [coreAndPre, ...preRest] = (mainPart || "").split("-");
  const preRelease =
    preRest.length > 0 ? [preRest.join("-")] : coreAndPre === undefined ? [] : [];

  const coreSegments = (coreAndPre || "")
    .split(".")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const numeric = Number.parseInt(segment, 10);
      return Number.isFinite(numeric) ? numeric : 0;
    });

  return {
    core: coreSegments,
    preRelease,
    build,
  };
};

const compareSegments = (a: number[], b: number[]): -1 | 0 | 1 => {
  const length = Math.max(a.length, b.length);
  for (let index = 0; index < length; index += 1) {
    const left = a[index] ?? 0;
    const right = b[index] ?? 0;
    if (left > right) return 1;
    if (left < right) return -1;
  }
  return 0;
};

export const compareVersions = (
  left: unknown,
  right: unknown,
): -1 | 0 | 1 => {
  const a = parseVersion(left);
  const b = parseVersion(right);

  const coreResult = compareSegments(a.core, b.core);
  if (coreResult !== 0) return coreResult;

  // Per semver: a version without pre-release has higher precedence than one
  // with pre-release when the core tuple is equal.
  const aHasPre = a.preRelease.length > 0;
  const bHasPre = b.preRelease.length > 0;

  if (aHasPre && !bHasPre) return -1;
  if (!aHasPre && bHasPre) return 1;

  return 0;
};

export const isVersionLessThan = (left: unknown, right: unknown) =>
  compareVersions(left, right) < 0;

export const isVersionGreaterThanOrEqual = (left: unknown, right: unknown) =>
  compareVersions(left, right) >= 0;
