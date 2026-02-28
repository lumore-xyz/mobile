/**
 * Formats a number into a readable string with K, M, B, T suffixes
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string
 */
function formatNumber(num: number, decimals: number = 1): string {
  if (num === 0) return "0";
  if (num < 0) return "-" + formatNumber(Math.abs(num), decimals);

  const units = [
    { value: 1e12, suffix: "T" }, // Trillion
    { value: 1e9, suffix: "B" }, // Billion
    { value: 1e6, suffix: "M" }, // Million
    { value: 1e3, suffix: "K" }, // Thousand
  ];

  for (const unit of units) {
    if (num >= unit.value) {
      const formatted = num / unit.value;
      // Remove unnecessary decimals (e.g., 1.0K -> 1K)
      const rounded = Number(formatted.toFixed(decimals));
      return rounded % 1 === 0
        ? `${Math.floor(rounded)}${unit.suffix}`
        : `${rounded}${unit.suffix}`;
    }
  }

  // For numbers less than 1000, return as is
  return num.toString();
}

export default formatNumber;
