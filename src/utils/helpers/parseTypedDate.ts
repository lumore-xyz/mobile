export default function parseTypedDate(value: string): Date | null {
  const trimmedValue = value.trim();
  const separatedDateMatch = trimmedValue.match(
    /^([0-9]{1,2})[\/.-]([0-9]{1,2})[\/.-]([0-9]{4})$/,
  );
  const compactDateMatch = trimmedValue.match(/^([0-9]{2})([0-9]{2})([0-9]{4})$/);
  const dateMatch = separatedDateMatch || compactDateMatch;

  if (!dateMatch) return null;

  const day = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const year = Number(dateMatch[3]);
  const parsedDate = new Date(year, month - 1, day);

  const isValidDate =
    parsedDate.getFullYear() === year &&
    parsedDate.getMonth() === month - 1 &&
    parsedDate.getDate() === day;

  return isValidDate ? parsedDate : null;
}
