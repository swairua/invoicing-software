/**
 * Utility functions for safe array operations
 */

/**
 * Safely ensures a value is an array
 */
export function ensureArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

/**
 * Safely filters an array with fallback to empty array
 */
export function safeFilter<T>(
  array: T[] | undefined | null,
  predicate: (value: T, index: number, array: T[]) => boolean,
): T[] {
  return ensureArray(array).filter(predicate);
}

/**
 * Safely maps an array with fallback to empty array
 */
export function safeMap<T, U>(
  array: T[] | undefined | null,
  callback: (value: T, index: number, array: T[]) => U,
): U[] {
  return ensureArray(array).map(callback);
}

/**
 * Safely gets the length of an array with fallback to 0
 */
export function safeLength(array: unknown[] | undefined | null): number {
  return Array.isArray(array) ? array.length : 0;
}

/**
 * Type guard to check if a value is an array
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
