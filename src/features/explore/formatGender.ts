export default function formatGender(gender?: string) {
  return gender
    ? gender.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
    : "";
}
