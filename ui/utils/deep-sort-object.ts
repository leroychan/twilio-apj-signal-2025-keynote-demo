/**
 * Deep sorts an object's keys alphabetically with primitives first
 * @param obj - The object to sort
 * @returns A new sorted object
 */
export function deepSortObject<T>(obj: T): T {
  // Return non-objects as is
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) return obj;

  // Get all keys and separate them into primitives and non-primitives
  const keys = Object.keys(obj as object);
  const primitiveKeys: string[] = [];
  const nonPrimitiveKeys: string[] = [];

  keys.forEach((key) => {
    const value = (obj as any)[key];
    if (value === null || value === undefined || typeof value !== "object") {
      primitiveKeys.push(key);
    } else {
      nonPrimitiveKeys.push(key);
    }
  });

  // Sort both groups alphabetically
  primitiveKeys.sort();
  nonPrimitiveKeys.sort();

  // Create a new object with sorted keys
  const sortedObj: any = {};

  // Add primitive keys first
  primitiveKeys.forEach((key) => {
    sortedObj[key] = (obj as any)[key];
  });

  // Add non-primitive keys next
  nonPrimitiveKeys.forEach((key) => {
    const value = (obj as any)[key];
    // Recursively sort nested objects, but leave arrays untouched
    if (Array.isArray(value)) {
      sortedObj[key] = value.map((item) =>
        typeof item === "object" && item !== null && !Array.isArray(item)
          ? deepSortObject(item)
          : item,
      );
    } else {
      sortedObj[key] = deepSortObject(value);
    }
  });

  return sortedObj as T;
}
