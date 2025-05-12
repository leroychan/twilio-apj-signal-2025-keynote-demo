/**
 * Type-safe utility function to omit properties from an object
 * @param obj The source object
 * @param keys Array of keys to omit
 * @returns A new object with omitted keys removed, original object untouched
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  ...keys: K[]
): Omit<T, K> {
  // Create a new object with all properties from the source
  const result = { ...obj };

  // Delete the keys from the copied object, not affecting the original
  for (const key of keys) delete result[key];

  return result as Omit<T, K>;
}
