import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
