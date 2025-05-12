import { describe, expect, it } from "vitest";
import { createDeepProxyEmitter } from "./deep-proxy-emitter.js";

type VersionedObject = { version: number };

interface RootState extends VersionedObject {
  num: number;
  str: string;
  bool: boolean;
  nil: null | string;
  undef?: number;
  arr: number[];
  arr2D: number[][];
  nested: {
    level1: {
      a: string;
      arr: { x: number }[];
    };
  };
}

/** Fresh proxied store + update log for every test */
function createStore(): { store: RootState; updates: string[] } {
  const base: RootState = {
    version: 0,
    num: 1,
    str: "initial",
    bool: false,
    nil: null,
    arr: [1, 2, 3],
    arr2D: [[99]],
    nested: {
      level1: {
        a: "value",
        arr: [{ x: 1 }, { x: 2 }],
      },
    },
  };

  const updates: string[] = [];
  const store = createDeepProxyEmitter(base, (p) => updates.push(p));
  return { store, updates };
}

describe("createDeepProxyEmitter", () => {
  /* ────────────────────  Primitive assignments  ──────────────────── */
  describe("primitive assignments", () => {
    it("number", () => {
      const { store, updates } = createStore();
      store.num = 42;
      expect(updates).toEqual(["num"]);
      expect(store.version).toBe(1);
    });

    it("string", () => {
      const { store, updates } = createStore();
      store.str = "changed";
      expect(updates).toEqual(["str"]);
      expect(store.version).toBe(1);
    });

    it("boolean", () => {
      const { store, updates } = createStore();
      store.bool = true;
      expect(updates).toEqual(["bool"]);
      expect(store.version).toBe(1);
    });

    it("null", () => {
      const { store, updates } = createStore();
      store.nil = null;
      expect(updates).toEqual(["nil"]);
      expect(store.version).toBe(1);
    });

    it("undefined", () => {
      const { store, updates } = createStore();
      store.undef = undefined;
      expect(updates).toEqual(["undef"]);
      expect(store.version).toBe(1);
    });

    it("symbol key", () => {
      const { store, updates } = createStore();
      const sym = Symbol("xyz");
      // @ts-expect-error – deliberate dynamic key
      store[sym] = 100;
      expect(String(updates[0])).toContain("Symbol(");
      expect(store.version).toBe(1);
    });
  });

  /* ────────────────────  Object replacement & deep updates  ──────────────────── */
  describe("object replacement and deep updates", () => {
    it("overwrites nested object", () => {
      const { store, updates } = createStore();
      store.nested = { level1: { a: "new", arr: [] } };
      expect(updates).toEqual(["nested"]);
      expect(store.version).toBe(1);
    });

    it("updates deeply nested primitive", () => {
      const { store, updates } = createStore();
      store.nested.level1.a = "changed";
      expect(updates).toEqual(["nested.level1.a"]);
      expect(store.version).toBe(1);
    });

    it("deletes nested property", () => {
      const { store, updates } = createStore();
      // @ts-expect-error – intentional: testing runtime delete behaviour
      delete store.nested.level1.a;
      expect(updates).toEqual(["nested.level1.a"]);
      expect(store.version).toBe(1);
      expect("a" in store.nested.level1).toBe(false);
    });

    it("deletes top‑level property", () => {
      const { store, updates } = createStore();
      // @ts-expect-error – intentional: testing runtime delete behaviour
      delete store.str;
      expect(updates).toEqual(["str"]);
      expect(store.version).toBe(1);
      expect("str" in store).toBe(false);
    });
  });

  /* ────────────────────  Array operations  ──────────────────── */
  describe("array operations", () => {
    it("overwrite entire array", () => {
      const { store, updates } = createStore();
      store.arr = [4, 5];
      expect(updates).toEqual(["arr"]);
      expect(store.version).toBe(1);
    });

    it("index assignment", () => {
      const { store, updates } = createStore();
      store.arr[1] = 99;
      expect(updates).toEqual(["arr.1"]);
      expect(store.version).toBe(1);
    });

    it("push", () => {
      const { store, updates } = createStore();
      store.arr.push(4);
      expect(updates).toEqual(["arr"]);
      expect(store.version).toBe(1);
      expect(store.arr).toEqual([1, 2, 3, 4]);
    });

    it("pop", () => {
      const { store, updates } = createStore();
      const popped = store.arr.pop();
      expect(popped).toBe(3);
      expect(updates).toEqual(["arr"]);
      expect(store.version).toBe(1);
      expect(store.arr).toEqual([1, 2]);
    });

    it("shift", () => {
      const { store, updates } = createStore();
      const shifted = store.arr.shift();
      expect(shifted).toBe(1);
      expect(updates).toEqual(["arr"]);
      expect(store.version).toBe(1);
      expect(store.arr).toEqual([2, 3]);
    });

    it("unshift", () => {
      const { store, updates } = createStore();
      store.arr.unshift(0);
      expect(updates).toEqual(["arr"]);
      expect(store.version).toBe(1);
      expect(store.arr).toEqual([0, 1, 2, 3]);
    });

    it("splice", () => {
      const { store, updates } = createStore();
      store.arr.splice(1, 1, 50);
      expect(updates).toEqual(["arr"]);
      expect(store.version).toBe(1);
      expect(store.arr).toEqual([1, 50, 3]);
    });

    it("sort", () => {
      const { store, updates } = createStore();
      store.arr.sort((a, b) => b - a);
      expect(updates).toEqual(["arr"]);
      expect(store.version).toBe(1);
      expect(store.arr).toEqual([3, 2, 1]);
    });

    it("reverse", () => {
      const { store, updates } = createStore();
      store.arr.reverse();
      expect(updates).toEqual(["arr"]);
      expect(store.version).toBe(1);
      expect(store.arr).toEqual([3, 2, 1]);
    });

    it("non‑mutating slice does not emit", () => {
      const { store, updates } = createStore();
      const slice = store.arr.slice(0, 2);
      expect(slice).toEqual([1, 2]);
      expect(updates).toEqual([]); // slice shouldn’t trigger update
      expect(store.version).toBe(0);
    });

    it("nested array push", () => {
      const { store, updates } = createStore();
      store.nested.level1.arr.push({ x: 3 });
      expect(updates).toEqual(["nested.level1.arr"]);
      expect(store.version).toBe(1);
      expect(store.nested.level1.arr.length).toBe(3);
    });

    it("update element inside nested array of objects", () => {
      const { store, updates } = createStore();
      store.nested.level1.arr[1].x = 42;
      expect(updates).toEqual(["nested.level1.arr.1.x"]);
      expect(store.version).toBe(1);
      expect(store.nested.level1.arr[1].x).toBe(42);
    });

    it("outer 2‑D array push", () => {
      const { store, updates } = createStore();
      store.arr2D.push([5, 6]);
      expect(updates).toEqual(["arr2D"]);
      expect(store.version).toBe(1);
    });

    it("inner 2‑D array push", () => {
      const { store, updates } = createStore();
      store.arr2D[0].push(99);
      expect(updates).toEqual(["arr2D.0"]);
      expect(store.version).toBe(1);
    });
  });

  /* ────────────────────  Version property semantics  ──────────────────── */
  describe("version property semantics", () => {
    it("setting version emits but does NOT auto‑increment again", () => {
      const { store, updates } = createStore();
      store.version = 10;
      expect(updates).toEqual(["version"]);
      expect(store.version).toBe(10);
    });
  });
});
