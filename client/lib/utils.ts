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
  predicate: (item: T) => boolean,
): T[] {
  return ensureArray(arr).filter(predicate);
}

/**
 * Safely format a date with fallback for invalid dates
 */
export function safeFormatDate(
  date: Date | string | null | undefined,
  formatString: string = "PPP",
  fallback: string = "Invalid date",
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
  fallback: string = "Unknown time",
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
 * Safely call toLocaleDateString with fallback
 */
export function safeToLocaleDateString(
  date: Date | string | null | undefined,
  locale: string = "en-GB",
  options?: Intl.DateTimeFormatOptions,
  fallback: string = "Invalid date",
): string {
  if (!date) return fallback;

  const dateObj = date instanceof Date ? date : new Date(date);
  if (!isValid(dateObj)) return fallback;

  try {
    return dateObj.toLocaleDateString(locale, options);
  } catch (error) {
    return fallback;
  }
}

/**
 * Safely call toLocaleTimeString with fallback
 */
export function safeToLocaleTimeString(
  date: Date | string | null | undefined,
  locale: string = "en-GB",
  options?: Intl.DateTimeFormatOptions,
  fallback: string = "Invalid time",
): string {
  if (!date) return fallback;

  const dateObj = date instanceof Date ? date : new Date(date);
  if (!isValid(dateObj)) return fallback;

  try {
    return dateObj.toLocaleTimeString(locale, options);
  } catch (error) {
    return fallback;
  }
}

/**
 * Safely call toISOString with fallback
 */
export function safeToISOString(
  date: Date | string | null | undefined,
  fallback: string = "",
): string {
  if (!date) return fallback;

  const dateObj = date instanceof Date ? date : new Date(date);
  if (!isValid(dateObj)) return fallback;

  try {
    return dateObj.toISOString();
  } catch (error) {
    return fallback;
  }
}

/**
 * Safely get date components for form inputs
 */
export function safeToDateInputValue(
  date: Date | string | null | undefined,
  fallback: string = "",
): string {
  const isoString = safeToISOString(date, fallback);
  return isoString ? isoString.split("T")[0] : fallback;
}

/**
 * Safely compare dates
 */
export function safeDateComparison(
  date1: Date | string | null | undefined,
  date2: Date | string | null | undefined,
): number {
  const d1 = date1 instanceof Date ? date1 : new Date(date1 || 0);
  const d2 = date2 instanceof Date ? date2 : new Date(date2 || 0);

  if (!isValid(d1) && !isValid(d2)) return 0;
  if (!isValid(d1)) return 1;
  if (!isValid(d2)) return -1;

  return d1.getTime() - d2.getTime();
}

/**
 * Safely format date using Kenya locale (en-KE)
 */
export function safeFormatDateKE(
  date: Date | string | null | undefined,
  fallback: string = "Invalid date",
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
  fallback: string = "Invalid date",
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
