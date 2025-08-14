/**
 * Safe string search utility functions to prevent null/undefined errors
 */

/**
 * Safely checks if a string contains another string (case-insensitive)
 * @param text - The text to search in (can be null/undefined)
 * @param searchTerm - The term to search for
 * @returns boolean indicating if the text contains the search term
 */
export function safeIncludes(text: string | null | undefined, searchTerm: string): boolean {
  if (!text) return false;
  if (!searchTerm) return true; // Show all items when search term is empty
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Safely filters an array of objects by multiple string fields
 * @param items - Array of items to filter
 * @param searchTerm - The term to search for
 * @param fields - Array of field names or getter functions to search in
 * @returns Filtered array
 */
export function safeFilter<T>(
  items: T[],
  searchTerm: string,
  fields: Array<keyof T | ((item: T) => string | null | undefined)>
): T[] {
  if (!searchTerm.trim()) return items;
  
  return items.filter(item => 
    fields.some(field => {
      const value = typeof field === 'function' 
        ? field(item) 
        : item[field];
      return safeIncludes(String(value || ''), searchTerm);
    })
  );
}

/**
 * Safe toLowerCase that handles null/undefined values
 * @param text - The text to convert to lowercase
 * @returns Lowercase string or empty string if input is null/undefined
 */
export function safeLowerCase(text: string | null | undefined): string {
  return (text || '').toLowerCase();
}

/**
 * Creates a safe search predicate for use with Array.filter
 * @param searchTerm - The term to search for
 * @param getSearchableText - Function that extracts searchable text from an item
 * @returns Predicate function for filtering
 */
export function createSearchPredicate<T>(
  searchTerm: string,
  getSearchableText: (item: T) => string
) {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  
  return (item: T): boolean => {
    if (!normalizedSearchTerm) return true;
    
    try {
      const searchableText = getSearchableText(item);
      return safeIncludes(searchableText, normalizedSearchTerm);
    } catch (error) {
      console.warn('Error in search predicate:', error);
      return false;
    }
  };
}
