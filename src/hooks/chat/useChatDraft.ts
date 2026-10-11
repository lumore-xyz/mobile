import { storage } from "@/src/service/storage";
import { useEffect, useState } from "react";

const DRAFT_KEY_PREFIX = "chat_draft_";

const useChatDraft = (roomId: string | null) => {
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!roomId) return;
    try {
      const saved = storage.getString(`${DRAFT_KEY_PREFIX}${roomId}`);
      if (saved) setDraft(saved);
    } catch (error) {
      console.error("[ChatScreen] Failed to read room draft:", error);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    try {
      const key = `${DRAFT_KEY_PREFIX}${roomId}`;
      if (draft.trim()) {
        storage.set(key, draft);
      } else {
        storage.remove(key);
      }
    } catch (error) {
      console.error("[ChatScreen] Failed to persist room draft:", error);
    }
  }, [draft, roomId]);

  return [draft, setDraft] as const;
};

export default useChatDraft;
