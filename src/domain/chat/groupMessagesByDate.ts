import type { Message } from "@/src/domain/chat/types";

export interface ChatMessageGroup {
  date: string;
  timestamp: number;
  messages: Message[];
}

export default function groupMessagesByDate(
  messages: Message[],
): ChatMessageGroup[] {
  const groups = new Map<string, ChatMessageGroup>();

  messages.forEach((message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    const group = groups.get(date);
    if (group) {
      group.messages.push(message);
      return;
    }

    groups.set(date, {
      date,
      timestamp: message.timestamp,
      messages: [message],
    });
  });

  return Array.from(groups.values()).sort(
    (first, second) => first.timestamp - second.timestamp,
  );
}
