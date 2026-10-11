export default function isValidOptionValue(
  value: string,
  options: { value: string }[],
  extras: string[] = [],
): boolean {
  return options.some((option) => option.value === value) || extras.includes(value);
}
