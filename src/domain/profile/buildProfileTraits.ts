import type { ProfileUser } from "@/src/domain/profile/types";
import getAgeFromDate from "@/src/utils/helpers/getAgeFromDate";
import convertHeight from "@/src/utils/helpers/convertHeight";
import extractFullAddressParts from "@/src/features/location/extractFullAddressParts";
import { languageDisplay } from "@/src/utils/helpers/languageDisplay";

export interface ProfileTrait {
  icon: string;
  value: string | number;
  type?: "lucide" | "image";
}

const hasDisplayValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && String(value).trim() !== "";
};

const buildProfileTraits = (user?: ProfileUser) => {
  const horizontal: ProfileTrait[] = [];
  const vertical: ProfileTrait[] = [];
  const add = (
    destination: ProfileTrait[],
    icon: string,
    value: unknown,
    type?: ProfileTrait["type"],
  ) => {
    if (!hasDisplayValue(value)) return;
    destination.push({ icon, value: typeof value === "number" ? value : String(value), type });
  };

  add(horizontal, "CakeSlice", user?.dob ? getAgeFromDate(user.dob) : null);
  add(horizontal, "UserRound", user?.gender);
  add(horizontal, "Magnet", user?.orientation);
  add(horizontal, "Ruler", user?.height ? convertHeight(user.height) : null);
  add(
    horizontal,
    "MapPin",
    user?.location?.formattedAddress
      ? extractFullAddressParts(user.location.formattedAddress, ["district"])
          .district
      : null,
  );
  add(horizontal, "Utensils", user?.diet);
  add(horizontal, "Sparkles", user?.zodiacSign);
  add(horizontal, "Beer", user?.lifestyle?.drinking);
  add(horizontal, "Cigarette", user?.lifestyle?.smoking);
  add(horizontal, "PawPrint", user?.lifestyle?.pets);
  add(horizontal, "Droplet", user?.bloodGroup);

  add(vertical, "Briefcase", user?.work, "lucide");
  add(vertical, "graduation.webp", user?.institution, "image");
  add(vertical, "Book", user?.religion, "lucide");
  add(vertical, "relationship.webp", user?.maritalStatus, "image");
  add(vertical, "MapPin", user?.homeTown || user?.hometown, "lucide");
  add(
    vertical,
    "Languages",
    user?.languages?.length ? languageDisplay(user.languages)?.join(", ") : null,
    "lucide",
  );
  add(vertical, "mask.webp", user?.personalityType, "image");

  return { horizontal, vertical };
};

export default buildProfileTraits;
