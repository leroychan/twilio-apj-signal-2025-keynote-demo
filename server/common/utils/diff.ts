/**
 * Performs a shallow comparison between two objects and returns all keys that have changed.
 * This includes:
 * - Keys with different values
 * - Keys that exist only in the first object
 * - Keys that exist only in the second object
 *
 * The comparison uses strict equality (===) for primitive values, which means object references
 * are compared by identity, not by their content.
 */

export function shallowDiff<
  T extends object = {},
  U extends object = {},
  R = Array<keyof T | keyof U>,
>(objA: T | undefined, objB: U | undefined): R {
  if (objA === undefined && objB === undefined) return [] as R;
  if (objA === undefined && objB) return Object.keys(objB) as R;
  if (objA && objB === undefined) return Object.keys(objA) as R;

  // Type guard to keep TypeScript happy - we know both are defined here
  if (!objA || !objB) return [] as R;

  const changedKeys = new Set<keyof T | keyof U>();

  Object.keys(objA).forEach((keyA) => {
    const typedKey = keyA as keyof T;
    // property changed
    if (
      keyA in objB &&
      (objA[typedKey] as any) !== (objB[keyA as keyof U] as any)
    )
      changedKeys.add(typedKey);

    // property removed
    if (!(keyA in objB)) changedKeys.add(typedKey);
  });

  Object.keys(objB).forEach((keyB) => {
    // property added
    if (!(keyB in objA)) changedKeys.add(keyB as keyof U);
  });

  return Array.from(changedKeys) as R;
}
