export type ChatSender =
  | string
  | { _id?: string; id?: string }
  | null
  | undefined;

const getChatSenderId = (
  sender: ChatSender,
  fallback?: string | null,
): string => {
  if (!sender) return fallback || "";
  if (typeof sender === "string") return sender;
  return sender._id || sender.id || fallback || "";
};

export default getChatSenderId;
