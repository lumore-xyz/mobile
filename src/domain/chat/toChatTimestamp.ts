const toChatTimestamp = (value?: string | number | null): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (!value) return null;
  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) return numericValue;
  const parsedValue = Date.parse(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

export default toChatTimestamp;
