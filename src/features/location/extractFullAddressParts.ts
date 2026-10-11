type AddressPart =
  | "area"
  | "subregion"
  | "district"
  | "state"
  | "pin"
  | "country";

interface ParsedAddress {
  area?: string;
  subregion?: string;
  district?: string;
  state?: string;
  pin?: string;
  country?: string;
}

export default function extractFullAddressParts(
  address: string,
  parts: AddressPart[] = [
    "area",
    "subregion",
    "district",
    "state",
    "pin",
    "country",
  ],
): ParsedAddress {
  const result: ParsedAddress = {};
  const reversedSegments = address
    .split(",")
    .map((segment) => segment.trim())
    .reverse();

  const [country = "", pin = "", state = "", district = "", subregion = "", area = ""] =
    reversedSegments;

  if (parts.includes("country")) result.country = country;
  if (parts.includes("pin")) result.pin = pin;
  if (parts.includes("state")) result.state = state;
  if (parts.includes("district")) result.district = district;
  if (parts.includes("subregion")) result.subregion = subregion;
  if (parts.includes("area")) result.area = area;

  return result;
}
