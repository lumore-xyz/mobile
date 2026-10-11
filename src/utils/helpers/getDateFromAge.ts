export default function getDateFromAge(age: number): Date {
  const today = new Date();
  return new Date(
    today.getFullYear() - age,
    today.getMonth(),
    today.getDate(),
  );
}
