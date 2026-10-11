const createClientMessageId = (userId: string): string =>
  `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default createClientMessageId;
