const DEFAULT_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
};

export default function formatTime(
  value: string | number | Date,
  locale?: string,
  options: Intl.DateTimeFormatOptions = DEFAULT_TIME_OPTIONS,
): string {
  return new Date(value).toLocaleTimeString(locale, options);
}
