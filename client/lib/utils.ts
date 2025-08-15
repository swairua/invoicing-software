import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely ensures a value is an array
 */
export function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Safely filter an array with validation
 */
export function safeFilter<T>(
  arr: T[] | null | undefined,
  predicate: (item: T) => boolean
): T[] {
  return ensureArray(arr).filter(predicate);
}

/**
 * Safely format a date with fallback for invalid dates
 */
export function safeFormatDate(
  date: Date | string | null | undefined,
  formatString: string = "PPP",
  fallback: string = "Invalid date"
): string {
  if (!date) return fallback;

  const dateObj = date instanceof Date ? date : new Date(date);
  return isValid(dateObj) ? format(dateObj, formatString) : fallback;
}

/**
 * Safely format relative time with fallback for invalid dates
 */
export function safeFormatDistanceToNow(
  date: Date | string | null | undefined,
  options: { addSuffix?: boolean } = { addSuffix: true },
  fallback: string = "Unknown time"
): string {
  if (!date) return fallback;

  const dateObj = date instanceof Date ? date : new Date(date);
  return isValid(dateObj) ? formatDistanceToNow(dateObj, options) : fallback;
}

/**
 * Safely check if a date value is valid
 */
export function isValidDate(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  return isValid(dateObj);
}

/**
 * Safely format date using Kenya locale (en-KE)
 */
export function safeFormatDateKE(
  date: Date | string | null | undefined,
  fallback: string = "Invalid date"
): string {
  if (!date) return fallback;

  const dateObj = date instanceof Date ? date : new Date(date);
  if (!isValid(dateObj)) return fallback;

  try {
    return new Intl.DateTimeFormat("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  } catch (error) {
    return fallback;
  }
}

/**
 * Safely format date using UK locale (en-GB)
 */
export function safeFormatDateGB(
  date: Date | string | null | undefined,
  fallback: string = "Invalid date"
): string {
  if (!date) return fallback;

  const dateObj = date instanceof Date ? date : new Date(date);
  if (!isValid(dateObj)) return fallback;

  try {
    return dateObj.toLocaleDateString("en-GB");
  } catch (error) {
    return fallback;
  }
}
