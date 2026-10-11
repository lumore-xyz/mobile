import type { ChatRoom } from "@/src/domain/chat/types";

const isChatRoomActive = (room: ChatRoom | undefined): boolean => {
  if (!room) return false;
  if (typeof room.isActive === "boolean") return room.isActive;
  if (room.endedAt || room.endedBy) return false;

  const status = String(room.status ?? "").toLowerCase().trim();
  return !status || !["archive", "archived", "ended", "closed", "inactive"].includes(status);
};

export default isChatRoomActive;
