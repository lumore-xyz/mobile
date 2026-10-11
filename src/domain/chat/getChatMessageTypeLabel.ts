export default function getChatMessageTypeLabel(
  messageType?: string | null,
  fallbackType?: string | null,
): "Photo" | "Voice note" | null {
  if (messageType === "image" || fallbackType === "image") return "Photo";
  if (messageType === "audio" || fallbackType === "audio") return "Voice note";
  return null;
}
