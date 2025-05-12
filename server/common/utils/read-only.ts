export type DeepReadonly<T> = T extends (...args: any[]) => any
  ? T
  : T extends Primitive
  ? T
  : T extends Array<infer U>
  ? ReadonlyArray<DeepReadonly<U>>
  : { readonly [K in keyof T]: DeepReadonly<T[K]> };

type Primitive = string | number | boolean | bigint | symbol | null | undefined;
