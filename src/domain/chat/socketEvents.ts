export const CHAT_SOCKET_EVENTS = {
  keyExchangeRequest: "key_exchange_request",
  keyExchangeResponse: "key_exchange_response",
  initKeyExchange: "init_key_exchange",
  joinChat: "joinChat",
  typing: "typing",
  newMessage: "new_message",
  messageSent: "message_sent",
  messageEdited: "message_edited",
  messageReactionUpdated: "message_reaction_updated",
  messageDelivered: "message_delivered",
  messageRead: "message_read",
  chatEnded: "chatEnded",
  inboxUpdated: "inbox_updated",
} as const;

export const EXPLORE_SOCKET_EVENTS = {
  matchFound: "matchFound",
  matchmakingError: "matchmakingError",
  insufficientCredits: "insufficientCredits",
  creditsUpdated: "creditsUpdated",
  profileLocked: "profileLocked",
  profileUnlocked: "profileUnlocked",
  chatEnded: "chatEnded",
} as const;
