import { MINIMUM_AGE } from "../config";

/**
 * Calculates age in full years from a "YYYY-MM-DD" date of birth.
 * Returns null if the date is missing or invalid.
 */
export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();

  // Subtract a year if this year's birthday hasn't happened yet.
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;

  return age;
}

/** True only when a valid DOB gives an age at or above MINIMUM_AGE. */
export function isOldEnough(dob: string | null | undefined): boolean {
  const age = calculateAge(dob);
  return age !== null && age >= MINIMUM_AGE;
}