const getEntityId = (value: unknown) => {
  if (value && typeof value === "object" && "_id" in value) {
    const nestedId = (value as { _id?: unknown })._id;
    return nestedId == null ? "" : String(nestedId);
  }
  return value == null ? "" : String(value);
};

export default function isSameEntityId(first: unknown, second: unknown) {
  const firstId = getEntityId(first);
  const secondId = getEntityId(second);
  return Boolean(firstId && secondId && firstId === secondId);
}
