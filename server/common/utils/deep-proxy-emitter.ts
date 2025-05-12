/**
 * @function createDeepProxyEmitter
 * @description Creates a deep proxy wrapper around an object that monitors all
 * changes made to it and its nested properties. Every time any part of the object
 * is modified, it automatically increments a version number and triggers an update
 * notification with the path that was modified. This is particularly useful for managing
 * state updates efficiently, especially during streaming operations where many rapid
 * changes might occur.
 *
 * This pattern is used to avoid excessive garbage collection that could occur given
 * the numerous updates that occur during completion streaming.
 *
 * @template T - The type of object to be versioned (must include a version number property)
 * @param baseObject - The object to be versioned
 * @param emitUpdate - Callback function to be called when the object is modified, with the path that was updated
 * @returns A proxied version of the object that tracks all changes
 */

export function createDeepProxyEmitter<T extends VersionedObject>(
  baseObject: T,
  emitUpdate: (path: string) => void,
): T {
  const clonedObject = JSON.parse(JSON.stringify(baseObject));
  return new Proxy(
    clonedObject,
    createVersionedHandler<T>(clonedObject, emitUpdate, ""),
  );
}

function createVersionedHandler<T extends object>(
  parentObject: VersionedObject,
  emitUpdate: (path: string) => void,
  currentPath: string,
): ProxyHandler<T> {
  return {
    get(target: any, prop: string | symbol) {
      const value = target[prop];

      // Skip symbol properties for path tracking
      const propName = typeof prop === "symbol" ? "" : prop.toString();

      // Calculate the new path
      const newPath = currentPath
        ? propName
          ? `${currentPath}.${propName}`
          : currentPath
        : propName;

      // Handle array methods that modify the array
      if (Array.isArray(target)) {
        const arrayMethodHandler = createArrayMethodHandler(
          target,
          prop,
          parentObject,
          emitUpdate,
          currentPath,
        );
        if (arrayMethodHandler) return arrayMethodHandler;
      }

      // Recursively wrap objects and arrays
      if (typeof value === "object" && value !== null) {
        return new Proxy(
          value,
          createVersionedHandler(parentObject, emitUpdate, newPath),
        );
      }

      return value;
    },

    set(target: any, prop: string | symbol, value: any) {
      // Calculate the path for this property
      const propName =
        typeof prop === "symbol" ? prop.toString() : prop.toString();
      const updatePath = currentPath ? `${currentPath}.${propName}` : propName;

      // Don't wrap the version property itself
      if (target === parentObject && prop === "version") {
        target[prop] = value;
        emitUpdate(updatePath);
        return true;
      }

      // Handle nested objects and arrays
      if (typeof value === "object" && value !== null) {
        target[prop] = Array.isArray(value)
          ? [...value] // Create a new array to proxy
          : { ...value }; // Create a new object to proxy

        target[prop] = new Proxy(
          target[prop],
          createVersionedHandler(parentObject, emitUpdate, updatePath),
        );
      } else target[prop] = value;

      // Increment version and emit update
      parentObject.version++;
      emitUpdate(updatePath);
      return true;
    },

    deleteProperty(target: any, prop: string | symbol) {
      const propName =
        typeof prop === "symbol" ? prop.toString() : prop.toString();
      const updatePath = currentPath ? `${currentPath}.${propName}` : propName;

      delete target[prop];
      parentObject.version++;
      emitUpdate(updatePath);
      return true;
    },
  };
}

// emits update events when an array is mutated
function createArrayMethodHandler(
  array: any[],
  prop: string | symbol,
  parentObject: VersionedObject,
  emitUpdate: (path: string) => void,
  currentPath: string,
) {
  const modifyingMethods = {
    push: (...items: any[]) => {
      const result = Array.prototype.push.apply(array, items);
      parentObject.version++;
      emitUpdate(`${currentPath}`);
      return result;
    },
    pop: () => {
      const result = Array.prototype.pop.apply(array);
      parentObject.version++;
      emitUpdate(`${currentPath}`);
      return result;
    },
    shift: () => {
      const result = Array.prototype.shift.apply(array);
      parentObject.version++;
      emitUpdate(`${currentPath}`);
      return result;
    },
    unshift: (...items: any[]) => {
      const result = Array.prototype.unshift.apply(array, items);
      parentObject.version++;
      emitUpdate(`${currentPath}`);
      return result;
    },
    splice: (
      ...args: [start: number, deleteCount: number, ...items: any[]]
    ) => {
      const result = Array.prototype.splice.apply(array, args);
      parentObject.version++;
      emitUpdate(`${currentPath}`);
      return result;
    },
    sort: (compareFn?: (a: any, b: any) => number) => {
      const result = Array.prototype.sort.apply(array, [compareFn]);
      parentObject.version++;
      emitUpdate(`${currentPath}`);
      return result;
    },
    reverse: () => {
      const result = Array.prototype.reverse.apply(array);
      parentObject.version++;
      emitUpdate(`${currentPath}`);
      return result;
    },
  };

  return modifyingMethods[prop as keyof typeof modifyingMethods];
}

type VersionedObject = { version: number };
