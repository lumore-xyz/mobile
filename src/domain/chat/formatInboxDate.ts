import formatShortDate from "@/src/utils/helpers/formatShortDate";
import formatTime from "@/src/utils/helpers/formatTime";

export default function formatInboxDate (value: unknown) {
  if (!value) return "";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return formatTime(date, "en-US");
  }
  return formatShortDate(date);
}
