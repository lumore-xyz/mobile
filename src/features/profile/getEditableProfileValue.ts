import type { ProfileUser } from "@/src/domain/profile/types";

export const getEditableProfileValue = (
  user: ProfileUser | undefined,
  field: string,
): unknown => {
  if (!user) return undefined;

  if (field === "dob") {
    return user.dob ? new Date(user.dob).toISOString().split("T")[0] : undefined;
  }

  if (field === "height") {
    return user.height == null ? undefined : String(user.height);
  }

  return user[field as keyof ProfileUser];
};
