import type { Message } from "@/src/domain/chat/types";

const mergeChatMessage = (messages: Message[], incoming: Message): Message[] => {
  const next = [...messages];

  if (incoming.clientMessageId) {
    const optimisticIndex = next.findIndex(
      (item) => item.clientMessageId === incoming.clientMessageId,
    );
    if (optimisticIndex >= 0) {
      next[optimisticIndex] = {
        ...next[optimisticIndex],
        ...incoming,
        pending: false,
      };
      return next.sort((a, b) => a.timestamp - b.timestamp);
    }
  }

  if (incoming._id) {
    const existingIndex = next.findIndex((item) => item._id === incoming._id);
    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        ...incoming,
        pending: false,
      };
      return next.sort((a, b) => a.timestamp - b.timestamp);
    }
  }

  next.push(incoming);
  return next.sort((a, b) => a.timestamp - b.timestamp);
};

export default mergeChatMessage;
