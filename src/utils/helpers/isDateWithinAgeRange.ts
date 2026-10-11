import getDateFromAge from "./getDateFromAge";

export default function isDateWithinAgeRange(
  value: Date,
  min: number,
  max: number,
): boolean {
  const youngestAllowedDate = getDateFromAge(min);
  const oldestAllowedDate = getDateFromAge(max);

  return value <= youngestAllowedDate && value >= oldestAllowedDate;
}
